# Connectivity Tests

This folder contains test scripts to verify connectivity with external services required by the AI Training Effectiveness Tracker application.

## Prerequisites

1. **Environment Variables**: Ensure your `.env` file is properly configured in the project root. Refer to [indotenv.md](../indotenv.md) for required variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `profile_name`
   - `region_name`

2. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Available Tests

### 1. Database Connectivity Test
Tests connection to Supabase PostgreSQL database.

**Run:**
```bash
npm run test:db
```

**What it tests:**
- Environment variables are loaded correctly
- Supabase client can be created
- Database tables are accessible (employees, admins)
- Database is responsive and healthy

### 2. AWS Services Test
Tests connection to AWS Bedrock for AI model access.

**Run:**
```bash
npm run test:aws
```

**What it tests:**
- AWS credentials are configured
- AWS Bedrock client can be created
- Model invocation works (using Claude 3 Haiku)
- IAM permissions are properly set

### 3. Run All Tests
Runs all connectivity tests sequentially.

**Run:**
```bash
npm run test:all
```

## Test Output

Each test provides detailed output including:
- ✅ Success indicators for passed checks
- ❌ Error messages with troubleshooting steps
- ⚠️ Warnings for non-critical issues
- 📊 Test results and summaries

## Common Issues & Solutions

### Database Test Failures

**Issue**: `Missing required environment variables`
- **Solution**: Check that `SUPABASE_URL` and `SUPABASE_KEY` are in your `.env` file

**Issue**: `Table does not exist`
- **Solution**: Run database migrations to create required tables

**Issue**: `Invalid API key`
- **Solution**: Verify your Supabase key in the project settings

### AWS Test Failures

**Issue**: `CredentialsProviderError`
- **Solution**: Configure AWS CLI with `aws configure --profile <profile_name>`

**Issue**: `AccessDeniedException`
- **Solution**: Ensure your IAM user/role has `bedrock:InvokeModel` permission

**Issue**: `ResourceNotFoundException`
- **Solution**: Enable model access in the AWS Bedrock console for your region

**Issue**: Model not available
- **Solution**: Verify AWS Bedrock is available in your region

## Environment Variables Reference

All environment variables are documented in [indotenv.md](../indotenv.md).

Required for these tests:

| Variable | Purpose | Example |
|----------|---------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `SUPABASE_KEY` | Supabase API key | `eyJhbGci...` |
| `profile_name` | AWS CLI profile | `default` |
| `region_name` | AWS region | `us-east-1` |

## Architecture

```
connectivity-tests/
├── test-database.js    # Database connectivity test
├── test-aws.js         # AWS Bedrock connectivity test
├── test-all.js         # Test runner (runs all tests)
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Next Steps

After all tests pass:
1. ✅ Your services are properly configured
2. ✅ Environment variables are correctly set
3. ✅ You can proceed with running the main application

If tests fail:
1. Review the error messages
2. Check troubleshooting steps in test output
3. Verify environment variables in `.env`
4. Consult [indotenv.md](../indotenv.md) for setup guidance
