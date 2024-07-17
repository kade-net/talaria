## Possible Message structure for deliver
```
IDENTITY_PUBLIC_KEY: Buffer - to be discadded by the node submitting the message
HEADER: Buffer - the message header
HEADER_SIGNATURE: Buffer - the signature of the header - to be used by the other users to verify the sender
MESSAGE: Buffer - the encrypted message
```