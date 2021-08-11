import $exec from 'fire-keeper/exec'
import $info from 'fire-keeper/info'
import $os from 'fire-keeper/os'

// function

const main = async () => {

  if (!$os('macos')) {
    $info(`invalid os '${$os()}'`)
    return
  }

  await $exec([
    'brew update',
    'brew upgrade',
    'brew upgrade --cask',
  ])
}

// export
export default main