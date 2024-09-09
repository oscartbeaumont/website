# Naive Approach

This approach using SST constructs is really slow to provision which is not really what we want for preview deployments.

## Usage

```bash
sst deploy --stage production
```

## Cleanup

```bash
sst remove --stage production
```
