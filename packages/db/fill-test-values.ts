import { contact, delegate, envelope, inbox, phonebook } from "./schema";
import db from "./index";

async function fillTestValues() {
    try {
        // Value with short address
        await db.insert(phonebook).values({
            address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            hid: "100",
            timestamp: new Date(),
            public_key: "0xf9bfb67cc07af8e115e0acabe560faa9c63466fda76b806596ac62141253626"
        });

        // Values that depend on short address
        await db.insert(contact).values({
            id: "83bd9905-b827-4ac2-aeb9-7994b8018916",
            address: "0xeaef3c98ef1d138fbedde9ad941ae7ecae800722e0d14842c5db3da64b5e35c",
            user_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1", // We need to update user address here
            accepted: true,
            timestamp: new Date(),
            envelope: {}
        });

        await db.insert(delegate).values({
            address: "0xc7a738149ae16eb0882285713d781885dc1d281b2440e851f23a0093c75f5c6",
            user_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            timestamp: new Date(),
            hid: "100",
            public_key: "0x2aaa26265fb89f7075f51798c204e9a27ca006b255e94013f38a00b3a5af154b",
        })


        // Good values
        await db.insert(phonebook).values([{
            address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",
            hid: "101",
            timestamp: new Date(),
            public_key: "0x4de611eff07041c1ac05e0fb8ad6e6415794cb4a1ae55aed95d465d1a2a701a"
        }, {
            address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            hid: "102",
            timestamp: new Date(),
            public_key: "0x1d2d24514fa5c15833394cac3c947c858fab0278202c20bd7da3ecd253f71ff8"
        }, {
            address: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            hid: "103",
            timestamp: new Date(),
            public_key: "0x205d7d6c99a2c2c0570445bf0714cf86d70c741d7ce42bd4739f79f7996b72ee"
        }]);


        // Inserting inbox after creating other accounts
        await db.insert(inbox).values({
            id: "@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941ae7ecae800722e0d14842c5db3da64b5e35ca",
            owner_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            initiator_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            timestamp: new Date(),
            hid: "@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941ae7ecae800722e0d14842c5db3da64b5e35ca"
        })

        await db.insert(envelope).values({
            id: "100",
            ref: "inbox::@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941::1715195668839::0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457::dm",
            timestamp: new Date(),
            hid: "100",
            inbox_name: "@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941ae7ecae800722e0d14842c5db3da64b5e35ca",
            sender_public_key: "0x205d7d6c99a2c2c0570445bf0714cf86d70c741d7ce42bd4739f79f7996b72ee",
            reciever_pubic_key: "0x1d2d24514fa5c15833394cac3c947c858fab0278202c20bd7da3ecd253f71ff8",
            content: {},
            sender: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            receiver: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            delegate_public_key: "0x2aaa26265fb89f7075f51798c204e9a27ca006b255e94013f38a00b3a5af154b",
        })

        await db.insert(contact).values([{
            id: "83bd9905-b827-4ac2-aeb9-7994b8018917",
            address: "0xebef3c98ef1d138fbedde9ad941ae7ecae800722e0d14842c5db3da64b5e35c",
            user_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8", // We need to update user address here
            accepted: true,
            timestamp: new Date(),
            envelope: {}
        }, {
            id: "b89845f5-1f1f-4f0f-b0a4-75014b4db07d",
            address: "0x838b4f43be8b7d94c0355c6e831775b99613847befce75a45491d136986ab688",
            user_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b", // We need to update user address here
            accepted: true,
            timestamp: new Date(),
            envelope: {}
        }, {
            id: "208ba3d2-9327-4c27-be4c-1774fd0393f8",
            address: "0x2c4f4a1a466034cd345eb1ed197257d481907ffba5583c197384bf3eac447dbf",
            user_address: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457", // We need to update user address here
            accepted: true,
            timestamp: new Date(),
            envelope: {}
        }]);

        await db.insert(delegate).values([{
            address: "0xa89087d77f00b61aee29cc097508815a7b5ca9b37beb10cbe02abe7941449702",
            user_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            timestamp: new Date(),
            hid: "101",
            public_key: "0xad4ba545236342f3c1b362abb87d194f24630b82e9977b560622e23dd3be2148",
        }, {
            address: "0xccdb6677c494f7da549d0726a68717feb958fe1e6402aa060881b81cc478ba9",
            user_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",
            timestamp: new Date(),
            hid: "102",
            public_key: "0x62d8c622668a099a9288bc430618af061412153ac9f772d8a4445d53c8b1044",
        }, {
            address: "0xd68adb920a192fadd968b5d927383dfeff616b29c279c48b46f852f6373001a8",
            user_address: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            timestamp: new Date(),
            hid: "103",
            public_key: "0xce0e17479f36c50237fec8ce5bb0224f16c65d87bd2201697eb5609fe9ee87d3",
        }]);

        await db.insert(inbox).values([{
            id: "@0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8:@0x838b4f43be8b7d94c0355c6e831775b99613847befce75a45491d136986ab688",
            owner_address: "0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8",
            initiator_address: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            timestamp: new Date(),
            hid: "@0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8:@0x838b4f43be8b7d94c0355c6e831775b99613847befce75a45491d136986ab688"
        } , {
            id: "@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b:@0x2c4f4a1a466034cd345eb1ed197257d481907ffba5583c197384bf3eac447dbf",
            owner_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            initiator_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            timestamp: new Date(),
            hid: "@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b:@0x2c4f4a1a466034cd345eb1ed197257d481907ffba5583c197384bf3eac447dbf"
        }, {
            id: "@0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457:@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            owner_address: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            initiator_address: "0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            timestamp: new Date(),
            hid: "@0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457:@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b"
        }])

        await db.insert(envelope).values([{
            id: "101",
            ref: "inbox::@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941::1715195668839::0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457::dm",
            timestamp: new Date(),
            hid: "101",
            inbox_name: "@0x6d85963d424e44a6a85912d941997cb3f2bc8ae4fc74e32e9ac56b1501023ff8:@0x838b4f43be8b7d94c0355c6e831775b99613847befce75a45491d136986ab688",
            sender_public_key: "0x205d7d6c99a2c2c0570445bf0714cf86d70c741d7ce42bd4739f79f7996b72ee",
            reciever_pubic_key: "0x1d2d24514fa5c15833394cac3c947c858fab0278202c20bd7da3ecd253f71ff8",
            content: {},
            sender: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            receiver: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            delegate_public_key: "0x2aaa26265fb89f7075f51798c204e9a27ca006b255e94013f38a00b3a5af154b",
        }, {
            id: "102",
            ref: "inbox::@0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457:@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b::1715196778742::0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b::dm",
            timestamp: new Date(),
            hid: "102",
            inbox_name: "@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b:@0x2c4f4a1a466034cd345eb1ed197257d481907ffba5583c197384bf3eac447dbf",
            sender_public_key: "0x205d7d6c99a2c2c0570445bf0714cf86d70c741d7ce42bd4739f79f7996b72ee",
            reciever_pubic_key: "0x1d2d24514fa5c15833394cac3c947c858fab0278202c20bd7da3ecd253f71ff8",
            content: {},
            sender: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            receiver: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
            delegate_public_key: "0x2aaa26265fb89f7075f51798c204e9a27ca006b255e94013f38a00b3a5af154b",
        }, {
            id: "103",
            ref: "inbox::@0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1:@0xeaef3c98ef1d138fbedde9ad941::1715195668839::0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457::dm",
            timestamp: new Date(),
            hid: "103",
            inbox_name: "@0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457:@0xd5bc50f9ae36a55c4e741919bea97c6443dff131581782d0979b2822d7d2db8b",
            sender_public_key: "0x205d7d6c99a2c2c0570445bf0714cf86d70c741d7ce42bd4739f79f7996b72ee",
            reciever_pubic_key: "0x1d2d24514fa5c15833394cac3c947c858fab0278202c20bd7da3ecd253f71ff8",
            content: {},
            sender: "0x2aaa26265fb89f7075f51798c204e9a27ca006b255e94013f38a00b3a5af154b",
            receiver: "0x4667d24fe69f6bd9c5d4bb0ef828a28c3210c591cd72da5f8d7cb4b88252c457",
            delegate_public_key: "0x69c18fb0d693ec30118535e3852763034a595977daa6ebeead254e5f54a7bd1",
        }])

        console.log("Completed creating test fields");

    } catch(err) {
        console.log(err);
    }
}

fillTestValues()