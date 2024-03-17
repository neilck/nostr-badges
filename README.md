## nostr-badges

Microservice for Nostr badges. 
Rather than manual badge awards, enables users to apply for and be awarded badges.

Extensible platform, where you can add your own badge and award logic.

### Latest Changes Version 0.2.0

Replaced `verifySession` and `getConfig` endpoints with JWT.
- iframed award badge URLs get `code` 
- award badge pages exchange `code` for web token
- successfully decoding of web token replaces `verifySession`
- inclusion of badge configuration parameters in token replaces `getConfig`
- call to `awardBadge` authorized by token instead of AKA_API_KEY

## Learn more

Still in development. 

Live at [AKA Profiles App](https://app.akaprofiles.com).

See [AKA Profiles Documentation](https://www.akaprofiles.com). 

.

