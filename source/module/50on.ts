import $i from 'fire-keeper/i'
import $info from 'fire-keeper/info'
import $prompt from 'fire-keeper/prompt'
import $read from 'fire-keeper/read'
import $say from 'fire-keeper/say'
import kleur from 'kleur'

// variable

const path = './data/50on.yaml' as const

// function

const ask = async (
  list: string[],
): Promise<string> => {

  let seed = Math.floor(Math.random() * list.length)
  const _list = list[seed].split(',')
  const answer = _list[0]
  let char = _list[1]

  seed = Math.floor(Math.random() * 2)
  char = char[seed]

  const value = await $prompt({
    default: 'exit',
    message: char,
    type: 'text',
  })

  if (value === 'exit') return ''

  const msg = `${char} -> ${answer}`
  $i(
    value === answer
      ? kleur.green(msg)
      : kleur.red(msg)
  )

  $info().pause()
  await $say(char, { lang: 'ja' })
  $info().resume()

  // loop
  return ask(list)
}

const main = async (): Promise<void> => {
  await ask(await load())
}

const load = async (): Promise<string[]> => await $read<string[]>(path)

// export
export default main