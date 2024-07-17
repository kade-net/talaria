module hermes::node {

    use std::signer;
    use std::string;
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::emit;
    use aptos_framework::timestamp;

    const SEED: vector<u8> = b"hermes_node";
    const NODE_DOES_NOT_EXIST: u64 = 100;

    #[event]
    struct Register has store,drop {
        bundle: string::String,
        timestamp: u64,
        originator: address,
        originator_id: u64,
    }

    #[event]
    struct ConversationRequest has store, drop {
        initiator: string::String,
        envelope: string::String,
        timestamp: u64,
        originator: address,
        originator_id: u64,
    }

    #[event]
    struct Envelope has store, drop {
        converation_id: string::String,
        header: string::String,
        message: string::String,
        timestamp: u64,
        originator: address,
        originator_id: u64,
    }

    struct Node has key {
        timestamp: u64,
        counter: u64
    }

    struct State has key {
        signer_capability: account::SignerCapability,
        nodes: u64
    }

    entry fun init_module(admin: &signer) {
        let (resource_signer, signer_capability) = account::create_resource_account(admin, SEED);

        move_to(&resource_signer, State {
            signer_capability,
            nodes: 0
        })
    }

    public entry fun register_node(node: &signer) acquires State {
        let resource_address = account::create_resource_address(&@hermes, SEED);

        let state = borrow_global_mut<State>(resource_address);

        move_to(node, Node {
            timestamp: timestamp::now_seconds(),
            counter: state.nodes
        });

        state.nodes = state.nodes + 1;
    }

    public entry fun deliver_event(node: &signer, type: string::String, args: vector<string::String>) acquires Node {
        let node_address = signer::address_of(node);
        let node = borrow_global_mut<Node>(node_address);
        assert!(exists<Node>(node_address), NODE_DOES_NOT_EXIST);

        if(type == string::utf8(b"register")){
            emit(Register {
                timestamp: timestamp::now_seconds(),
                bundle: *vector::borrow(&args,0),
                originator: node_address,
                originator_id: node.counter
            })
        };

        if(type == string::utf8(b"conversation_request")){
            emit(ConversationRequest {
                originator_id: node.counter,
                originator: node_address,
                timestamp: timestamp::now_seconds(),
                envelope: *vector::borrow(&args, 1),
                initiator: *vector::borrow(&args, 0)
            })
        };

        if(type == string::utf8(b"envelope")) {
            emit(Envelope {
                timestamp:timestamp::now_seconds(),
                originator: node_address,
                originator_id: node.counter,
                converation_id: *vector::borrow(&args, 0),
                header: *vector::borrow(&args, 1),
                message: *vector::borrow(&args, 2)
            });
        };

        node.counter = node.counter + 1;
    }

}
