import './global'
import nacl from 'tweetnacl'
import { Button, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { HermesMessaging, HermesRnModule } from 'hermes-rn';
import { useEffect, useMemo } from 'react';
import { setupParticipant } from './utils';
import * as FileSystem from 'expo-file-system'

const alice = setupParticipant()
const bob = setupParticipant()

const aliceBranch = new HermesMessaging.Branch(
  alice.prekeyPair.secretKey,
  bob.bundle,
  alice.identityKeyPair.secretKey
)

const bobsBranch = new HermesMessaging.Branch(
  bob.prekeyPair.secretKey,
  alice.bundle,
  bob.identityKeyPair.secretKey,
  'receiver'
)

async function getFileBuffer(uri: string) {
  try {
    console.log("URI::", uri)
    const base64String = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    })

    const buffer = Buffer.from(base64String, 'base64')

    return buffer
  }
  catch (e) {
    console.log(`SOMETHING WENT WRONG:: ${e}`)
    throw new Error('Unable to get file blob')
  }
}

export default function App() {

  const pickImage = async () => {

    try {

      const document = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true
      })

      if (document.canceled) {
        console.log("Document Picker Canceled")
        return
      }

      const file = document.assets.at(0)

      console.log("File:: ", file)

      // const attachmentBuffer = await getFileBuffer(file?.uri!)

      const { header, mk } = await aliceBranch.get_encryption_key()

      const attachment = new HermesMessaging.Attachment(
        HermesMessaging.AttachmentType.Video
      )

      const start = performance.now()
      const encryptedAttachment = await attachment.encrypt(mk, file?.uri!)
      const end = performance.now()
      console.log('TIME TAKEN::', end - start)

      const decryptedAttachment = await attachment.decrypt(mk, encryptedAttachment)

      console.log("Decrypted Attachment::", decryptedAttachment)

    }
    catch (e) {
      console.log("Something went wron::", e)
    }


  };

  useEffect(() => {
    ; (async () => {

      const alice = setupParticipant()
      const bob = setupParticipant()

      const aliceBranch = new HermesMessaging.Branch(
        alice.prekeyPair.secretKey,
        bob.bundle,
        alice.identityKeyPair.secretKey,
        'initiator'
      )

      const bobsBranch = new HermesMessaging.Branch(
        bob.prekeyPair.secretKey,
        alice.bundle,
        bob.identityKeyPair.secretKey,
        'receiver'
      )

      console.log("ALICE CONVERSATION ID::", aliceBranch.conversationState.BRANCH_ID)
      console.log("BOB CONVERSATION ID::", bobsBranch.conversationState.BRANCH_ID)

      const message = new HermesMessaging.Message('Hello World', HermesMessaging.MessageType.MESSAGE).serialize()

      const encrypted = await aliceBranch.encrypt(message)
      console.log("Message Key::", encrypted.mk)
      console.log("Message Key Length::", encrypted.mk.length)
      const decrypted = await bobsBranch.decrypt(encrypted.message.ciphertext, encrypted.header)
      const decryptedMessage = HermesMessaging.Message.deserialize(decrypted.plaintext)

      console.log("Decrypted Message::", decryptedMessage)
    })();
  }, [])

  return (
    <View style={styles.container}>
      <Text></Text>
      <Button
        title='Image Picket'
        onPress={pickImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
