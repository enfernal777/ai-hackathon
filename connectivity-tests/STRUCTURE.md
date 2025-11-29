# Connectivity Tests - Project Structure

## 📁 Current Structure

```
connectivity-tests/
├── package.json          # Clean dependencies (5 packages)
├── package-lock.json     # (gitignored)
├── node_modules/         # (gitignored)
├── README.md             # Usage documentation
├── test-database.js      # Supabase connectivity test
├── test-aws.js           # AWS Bedrock test (auto-refresh)
├── test-all.js           # Run all tests
└── list-bedrock-models.js # List available models
```

## 📦 Dependencies (5 packages - all used)

```json
{
  "@aws-sdk/client-bedrock": "^3.0.0",           // List models
  "@aws-sdk/client-bedrock-runtime": "^3.0.0",   // Invoke models
  "@aws-sdk/credential-providers": "^3.0.0",     // AWS auth
  "@supabase/supabase-js": "^2.0.0",            // Database
  "dotenv": "^16.0.0"                            // Environment vars
}
```

### ✅ Removed (3 unused packages)
- `@aws-sdk/client-iam` - Was only for check-iam.js (deleted)
- `@aws-sdk/client-sts` - Was only for check-iam.js (deleted)
- Obsolete scripts removed

## 🚫 Gitignored Files

```
connectivity-tests/node_modules/
connectivity-tests/package-lock.json
bedrock-models-raw.json
```

## 📝 Available Scripts

```bash
npm run test:db        # Test Supabase database
npm run test:aws       # Test AWS Bedrock (auto-refresh creds!)
npm run test:all       # Run all connectivity tests
npm run list-models    # List available Bedrock models
```

## ✨ Clean & Organized

- ✅ Only essential dependencies
- ✅ Build artifacts gitignored
- ✅ All scripts functional
- ✅ No unused packages
- ✅ Ready for development
