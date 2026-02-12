
import { visualizeSnippet } from './src/utils/visualizer.js';

const code = `
class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[j] == target - nums[i]) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[] {};
    }
}
`;

const inputs = {
    nums: [2, 7, 11, 15],
    target: 9
};

console.log("Running visualization for Two Sum...");
try {
    const result = visualizeSnippet(code, inputs);
    console.log("Steps generated:", result.steps.length);

    // Check if it returns correctly
    // Test evaluateExpression directly
    console.log("\n--- Direct Evaluation Test ---");
    const { evaluateExpression } = require('./src/utils/visualizer.js');

    // Mock state
    const variables = { i: { type: 'int', value: 0 } };
    const arrays = { nums: [2, 7, 11, 15] };

    try {
        console.log("Evaluating 'nums.length':", evaluateExpression("nums.length", variables, arrays));
        console.log("Evaluating 'i < nums.length':", evaluateExpression("i < nums.length", variables, arrays));
    } catch (e) {
        console.error("Direct Eval Error:", e);
    }

} catch (e) {
    console.error("Error:", e);
}
