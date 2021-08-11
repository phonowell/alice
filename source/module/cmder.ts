import $argv from 'fire-keeper/argv'
import $exec from 'fire-keeper/exec'
import $os from 'fire-keeper/os'
import $prompt from 'fire-keeper/prompt'
import $read from 'fire-keeper/read'

// interface

type Data = {
  [key: string]: string | string[]
}

type File = {
  [key: string]: Data
}

type Os = 'macos'

// function

const ask = async (
  data: Data,
) => {

  const list = Object.keys(data)

  const value = await $prompt({
    id: 'cmd',
    list,
    message: 'command',
    type: 'auto',
  })

  if (!list.includes(value)) return ''

  return value
}

const main = async () => {

  const os = $os()
  if (os !== 'macos') throw new Error(`invalid os '${os}'`)

  const data = await load(os)

  const target: string = $argv()._[1] as string
    || $argv().target as string
    || await ask(data)
  if (!target) return

  const item = data[target]
  const cmd = typeof item === 'string'
    ? [item]
    : item

  await $exec(cmd)
}

const load = async (
  os: Os,
) => (await $read<File>('./data/cmd.yaml'))[os]

// export
export default main