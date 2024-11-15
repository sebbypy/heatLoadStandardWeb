function solveLinearSystem(A, b) {
    const n = A.length;

    // Forward elimination
    for (let i = 0; i < n; i++) {
        // Find the maximum element in the current column for partial pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) {
                maxRow = k;
            }
        }

        // Swap the maximum row with the current row
        [A[i], A[maxRow]] = [A[maxRow], A[i]];
        [b[i], b[maxRow]] = [b[maxRow], b[i]];

        // Make all rows below this one 0 in the current column
        for (let k = i + 1; k < n; k++) {
            const factor = A[k][i] / A[i][i];
            for (let j = i; j < n; j++) {
                A[k][j] -= factor * A[i][j];
            }
            b[k] -= factor * b[i];
        }
    }

    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
            sum += A[i][j] * x[j];
        }
        x[i] = (b[i] - sum) / A[i][i];
    }

    return x;
}

/*
// Example usage
const A = [
    [2, 3, -1],
    [4, 4, -3],
    [2, -3, 1]
];
const b = [5, 3, -1];

const solution = solveLinearSystem(A, b);
console.log('Solution:', solution);
*/