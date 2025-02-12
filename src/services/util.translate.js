const alpha = "`1234567890-=~!@#$%^&*()_+qwertyuiop[]\\QWERTYUIOP{}|asdfghjkl;'ASDFGHJKL:\"zxcvbnm,./ZXCVBNM<>? \n"
let encryptedKey

function findChar(char, searchKey, retrieveKey) {
  let index = searchKey.indexOf(char)

  if (index >= 0 && index < searchKey.length) return retrieveKey[index]
  else console.log("Could not find: " + char)
}
function removeByIndex(text, i) {
  return text.substring(0, i) + text.substring(i + 1)
}

function buildEncrypted(key) {
  // Reset the key to its default state
  encryptedKey = alpha

  // Convert the encryption key by removing duplicate letters
  let noDups = key
    .split("")
    .filter((char, pos, self) => self.indexOf(char) === pos)

  var i
  // Push every character of the user specified encryption key to the front of the encrypted alphabet key
  for (let char of noDups)
    if ((i = encryptedKey.indexOf(char)) >= 0)
      encryptedKey = char + removeByIndex(encryptedKey, i)

  if (encryptedKey.length !== alpha.length)
    alert("Failed to encrypt alpha key correctly")
}

export const getKey = (key) => {
  if (key) 
    buildEncrypted(key)
  else 
    alert("Could not find Key in localStorage!")
}

function translate(text, searchKey, retrieveKey) {
  if (text && searchKey && retrieveKey && encryptedKey) {
    let encrypted = ""

    for (let char of text) encrypted += findChar(char, searchKey, retrieveKey)

    return encrypted
  } else if (!text) {
    alert("Nothing to encrypt")
  } else if (!encryptedKey) {
    alert("Encryption key not built")
  }

  return null
}

export const encryption = (text) => {
  return translate(text, alpha, encryptedKey)
}
export const decryption = (text) => {
  return translate(text, encryptedKey, alpha)
}