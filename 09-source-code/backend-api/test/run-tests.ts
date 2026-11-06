import { runAllAcceptanceAndSecurityTests } from './acceptance-suite.ts';

const report = runAllAcceptanceAndSecurityTests();
console.log(`=== Parental Control Backend Acceptance & Security Suite ===`);
console.log(`Executed at: ${report.executedAtUtc}`);
for (const r of report.results) {
  console.log(
    `[${r.passed ? 'PASS' : 'FAIL'}] ${r.testId} (${r.tier}) — ${r.title}\n       -> ${r.assertionSummary}`
  );
}
console.log(`\nSummary: ${report.passed}/${report.total} passed, ${report.failed} failed.`);
if (!report.allPassed) {
  process.exit(1);
}
