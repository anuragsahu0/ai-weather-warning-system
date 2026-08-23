import { datasetSplitter } from '../services/historical/datasetSplitter.js';

export function runDatasetSplitterTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const items = Array.from({ length: 100 }, (_, i) => {
    const d = new Date(Date.UTC(2024, 6, 1, i, 0, 0));
    return {
      id: `item-${i}`,
      observedAt: d.toISOString(),
    };
  });

  // Test 1: Chronological partition ratios and isolation
  try {
    const split = datasetSplitter.splitChronological(items, 0.7, 0.15);

    const hasCorrectCounts =
      split.train.length === 70 && split.val.length === 15 && split.test.length === 15;

    const maxTrainTime = new Date(split.train[split.train.length - 1].observedAt).getTime();
    const minValTime = new Date(split.val[0].observedAt).getTime();
    const maxValTime = new Date(split.val[split.val.length - 1].observedAt).getTime();
    const minTestTime = new Date(split.test[0].observedAt).getTime();

    const isStrictlyChronological = maxTrainTime < minValTime && maxValTime < minTestTime;

    results.push({
      name: 'DatasetSplitter: Strict chronological partitioning with zero timestamp overlap',
      passed: hasCorrectCounts && isStrictlyChronological,
      error: `train: ${split.train.length}, val: ${split.val.length}, test: ${split.test.length}`,
    });
  } catch (err: unknown) {
    results.push({
      name: 'DatasetSplitter: Strict chronological partitioning with zero timestamp overlap',
      passed: false,
      error: (err as Error).message,
    });
  }

  return results;
}
