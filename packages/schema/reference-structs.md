```move

    // Messaging 
    #[event]
    struct Envelope has store, drop {
        sender: address,
        receiver: address,
        content: string::String,
        timestamp: u64,
        hid: u64,
        ref: string::String
    }

    // Request Inbox

    #[event]
    struct RequestInboxRegisterEvent has store, drop, copy {
        user_address: address,
        timestamp: u64,
        hid: u64
    }

    #[event]
    struct RequestEvent has store, drop, copy {
        requester_address: address,
        inbox_owner_address: address,
        envelope: string::String,
        timestamp: u64
    }

    #[event]
    struct AcceptRequestEvent has store, drop, copy {
        requester_address: address,
        inbox_owner_address: address,
        timestamp: u64
    }

    #[event]
    struct RequestDeniedEvent has store, drop, copy  {
        requester_address: address,
        inbox_owner_address: address,
        timestamp: u64
    }

    #[event]
    struct RequestRemoveFromPhoneBookEvent has store, drop {
        inbox_owner_address: address,
        timestamp: u64,
        requester_address: address,
    }

    #[event]
    struct DelegateRegisterEvent has store, drop {
        owner: address,
        delegate_hid: u64,
        user_hid: u64,
        delegate_address: address,
    }

    #[event]
    struct DelegateRemoveEvent has store, drop {
        delegate_address: address,
        delegate_hid: u64,
        owner_address: address,
        owner_hid: u64,
    }
```