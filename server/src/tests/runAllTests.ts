import { runValidationTests } from './weatherValidation.test.js';
import { runNormalizerTests } from './normalizer.test.js';
import { runQualityEngineTests } from './qualityEngine.test.js';
import { runDeduplicationTests } from './deduplication.test.js';
import { runGridEngineTests } from './gridEngine.test.js';
import { runSpatialQueriesTests } from './spatialQueries.test.js';
import { runGridAggregatorTests } from './gridAggregator.test.js';
import { runTemporalAlignerTests } from './temporalAligner.test.js';
import { runFeatureEngineerTests } from './featureEngineer.test.js';
import { runTargetGeneratorTests } from './targetGenerator.test.js';
import { runDatasetSplitterTests } from './datasetSplitter.test.js';
import { runMLInferenceTests } from './mlInference.test.js';
import { runSpatioTemporalInferenceTests } from './spatiotemporalInference.test.js';
import { runProviderAdapterTests } from './providerAdapters.test.js';
import { runDataFusionTests } from './dataFusion.test.js';
import { runRiskEngineTests } from './riskEngine.test.js';
import { runRiskHysteresisTests } from './riskHysteresis.test.js';
import { runRiskHotspotsTests } from './riskHotspots.test.js';
import { runAlertDecisionTests } from './alertDecision.test.js';
import { runNotificationPolicyTests } from './notificationPolicy.test.js';
import { runNotificationQueueTests } from './notificationQueue.test.js';
import { runSystemHealthTests } from './systemHealth.test.js';
import { runScenarioReplayTests } from './scenarioReplay.test.js';
import { runEndToEndLineageTests } from './endToEndLineage.test.js';
import { runSihEvidenceTests } from './sihEvidence.test.js';

async function main() {
  console.log('\n🧪 ==============================================================');
  console.log('   ERROR 404 — Complete Phase 1 to 12 Automated Test Suite');
  console.log('==============================================================\n');

  const allTests = [
    // Phase 2 Tests
    ...runValidationTests(),
    ...runNormalizerTests(),
    ...runQualityEngineTests(),
    ...runDeduplicationTests(),

    // Phase 3 Tests
    ...runGridEngineTests(),
    ...runSpatialQueriesTests(),
    ...runGridAggregatorTests(),

    // Phase 4 Tests
    ...runTemporalAlignerTests(),
    ...runFeatureEngineerTests(),
    ...runTargetGeneratorTests(),
    ...runDatasetSplitterTests(),

    // Phase 5 Tests
    ...runMLInferenceTests(),

    // Phase 6 Tests
    ...runSpatioTemporalInferenceTests(),

    // Phase 7 Tests
    ...runProviderAdapterTests(),
    ...runDataFusionTests(),

    // Phase 8 Tests
    ...runRiskEngineTests(),
    ...runRiskHysteresisTests(),
    ...runRiskHotspotsTests(),

    // Phase 9 Tests
    ...runAlertDecisionTests(),
    ...runNotificationPolicyTests(),
    ...runNotificationQueueTests(),

    // Phase 10 Tests
    ...runSystemHealthTests(),

    // Phase 11 Tests
    ...runScenarioReplayTests(),
    ...runEndToEndLineageTests(),

    // Phase 12 Tests
    ...runSihEvidenceTests(),
  ];

  let passedCount = 0;
  let failedCount = 0;

  for (const test of allTests) {
    if (test.passed) {
      console.log(`  ✅ PASS: ${test.name}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${test.name}`);
      if (test.error) {
        console.error(`     Details: ${test.error}`);
      }
      failedCount++;
    }
  }

  console.log('\n--------------------------------------------------------------');
  console.log(`Total: ${allTests.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('==============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
