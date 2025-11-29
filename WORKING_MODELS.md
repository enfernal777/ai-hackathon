# AWS Bedrock Models - Status

**Region**: eu-central-1  
**Last Tested**: 2025-11-28

---

## ✅ WORKING (4 models)

### Text Generation

**Amazon Titan Text Express**
- Model ID: `amazon.titan-text-express-v1`
- Use: Quiz generation, content creation

**Amazon Titan Text Lite**
- Model ID: `amazon.titan-text-lite-v1`
- Use: Lightweight text generation

### Embeddings

**Amazon Titan Embeddings G1**
- Model ID: `amazon.titan-embed-text-v1`
- Use: Text similarity, search

**Amazon Titan Embeddings G2**
- Model ID: `amazon.titan-embed-text-v2:0`
- Use: Advanced embeddings

---

## ❌ NOT WORKING (3 models tested)

**Claude 3 Haiku**
- Model ID: `anthropic.claude-3-haiku-20240307-v1:0`
- Reason: AccessDeniedException

**Amazon Nova Lite**
- Model ID: `amazon.nova-lite-v1:0`
- Reason: ValidationException

**Meta Llama 3.2 1B**
- Model ID: `meta.llama3-2-1b-instruct-v1:0`
- Reason: ValidationException

---

**Total Tested**: 7 models  
**Success Rate**: 4/7 (57%)  
**Ready for Hackathon**: ✅ YES
