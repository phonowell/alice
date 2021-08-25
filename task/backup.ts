import $isExisted from 'fire-keeper/isExisted'
import $os from 'fire-keeper/os'
import $zip from 'fire-keeper/zip'

// function

const main = async () => {

  if (!$os(['macos', 'windows']))
    throw new Error('invalid os')

  const path = await makePath()
  if (!path) throw new Error('found no OneDrive directory')

  await $zip(`${path}/**/*`, `${path}/..`, 'OneDrive.zip')
}

const makePath = async () => {
  const os = $os()

  if (os === 'macos') return '~/OneDrive'

  const listPath = [
    'D:/OneDrive',
    'E:/OneDrive',
  ]
  for (const path of listPath) {
    if (!await $isExisted(path)) continue
    return path
  }

  return ''
}

// export
export default main