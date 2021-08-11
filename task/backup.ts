import $os from 'fire-keeper/os'
import $zip from 'fire-keeper/zip'

// function

const main = async () => {

  const os = $os()
  if (os !== 'macos' && os !== 'windows')
    throw new Error(`invalid os '${os}'`)

  const path = {
    macos: '~/OneDrive',
    windows: 'E:/OneDrive',
  }[os]

  await $zip(`${path}/**/*`, `${path}/..`, 'OneDrive.zip')
}

// export
export default main