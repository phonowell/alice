import $info from 'fire-keeper/info'
import $os from 'fire-keeper/os'
import $remove from 'fire-keeper/remove'
import $source from 'fire-keeper/source'

// function

const main = async () => {

  if (!$os('macos')) {
    $info(`invalid os '${$os()}'`)
    return
  }

  const listSource = await $source([
    '~/OneDrive/**/.DS_Store',
    '~/Project/**/.DS_Store',
  ])

  if (!listSource.length) return
  await $remove(listSource)
}

// export
export default main