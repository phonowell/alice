import $copy from 'fire-keeper/copy'
import $exec from 'fire-keeper/exec'
import $getBasename from 'fire-keeper/getBasename'
import $getName from 'fire-keeper/getName'
import $info from 'fire-keeper/info'
import $isExisted from 'fire-keeper/isExisted'
import $os from 'fire-keeper/os'
import $read from 'fire-keeper/read'
import $remove from 'fire-keeper/remove'
import $rename from 'fire-keeper/rename'
import $source from 'fire-keeper/source'
import $wrapList from 'fire-keeper/wrapList'
import $write from 'fire-keeper/write'

// interface

type Path = {
  document: string
  kindlegen: string
  storage: string
  temp: string
}

// variable

const isWindows = $os('windows')

const path: Path = isWindows
  ? {
    document: 'G:/documents',
    kindlegen: 'E:/OneDrive/程序/kindlegen/kindlegen.exe',
    storage: 'E:/OneDrive/书籍/同步',
    temp: './temp/kindle',
  } as const
  : {
    document: '/Volumes/Kindle/documents',
    kindlegen: '~/OneDrive/程序/kindlegen/kindlegen',
    storage: '~/OneDrive/书籍/同步',
    temp: './temp/kindle',
  } as const

const html = [
  '<html lang="zh-cmn-Hans">',
  '<head>',
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>',
  '</head>',
  '<body>',
  '{{content}}',
  '</body>',
  '</html>',
].join('')

// function

const checkUnicode = async (): Promise<boolean> => {

  const sub = async (
    source: string,
  ) => !~(await $read<string>(source)).search(/我/u)

  const listSource = await $source(`${path.storage}/*.txt`)
  const listResult = await Promise.all(listSource.map(sub))
  const listOutput: string[] = []
  listResult.forEach((result, i) => {
    if (result) listOutput.push($getBasename(listSource[i]))
  })

  if (listOutput.length)
    $info(`invalid file encoding: ${$wrapList(listOutput)}`)

  return listOutput.length === 0
}

const clean = (): Promise<void> => $remove(path.temp)

const formatPathWindows = (
  input: string,
): string => input
  .replace(/\[/g, '`[')
  .replace(/\]/g, '`]')

const html2mobi = async (
  source: string,
): Promise<void> => {

  const { basename } = $getName(source)
  const target = isWindows
    ? `${path.temp}/${basename}.html`
    : `"${path.temp}/${basename}.html"`

  const cmd = [
    path.kindlegen,
    `${target}`,
    '-c1',
    '-dont_append_source',
  ].join(' ')

  await $exec(cmd)
}

const image2html = async (
  source: string,
): Promise<void> => {

  const { basename } = $getName(source)
  const target = `${path.temp}/${basename}.html`

  const listImage = await $source(`${source}/*.jpg`)
  const listResult = (await Promise.all(listImage.map(src => $read<Buffer>(src))))
    .map(buffer => buffer.toString('base64'))
    .map((data, i) => `<p><img alt='${1 + i}.jpg' src='data:image/jpeg;base64,${data}'></p>`)

  const content = html.replace('{{content}}', listResult.join('\n'))
  await $write(target, content)
}

const isExistedOnKindle = async (
  source: string,
): Promise<boolean> => {

  const { basename } = $getName(source)
  return $isExisted(`${path.document}/${basename}.mobi`)
}

const main = async (): Promise<void> => {

  if (!await validateEnvironment()) return

  await renameManga()
  await renameNovel()
  if (!await checkUnicode()) return

  const subManga = async (
    source: string,
  ) => {
    if (await isExistedOnKindle(source)) return
    await image2html(source)
    await html2mobi(source)
    await moveToKindle(source)
  }

  const subNovel = async (
    source: string,
  ) => {
    if (await isExistedOnKindle(source)) return
    await txt2html(source)
    await html2mobi(source)
    await moveToKindle(source)
  }

  if (!isWindows) await Promise.all((await $source([`${path.storage}/*`, `!${path.storage}/*.txt`])).map(subManga))
  await Promise.all((await $source(`${path.storage}/*.txt`)).map(subNovel))
  await clean()
}

const moveToKindle = async (
  source: string,
): Promise<void> => {
  const { basename } = $getName(source)
  await $copy(`${path.temp}/${basename}.mobi`, path.document)
}

const rename = (
  input: string,
): string => input
  .replace(/,/g, '，')
  .replace(/:/g, '：')
  .replace(/\!/g, '！')
  .replace(/\(/g, '（')
  .replace(/\)/g, '）')
  .replace(/</g, '《')
  .replace(/>/g, '》')
  .replace(/\[/g, '【')
  .replace(/\]/g, '】')

const renameManga = async () => {

  const sub = async (
    source: string,
  ) => {
    const { basename } = $getName(source)
    const _basename = rename(basename)
    if (_basename === basename) return

    const _source = source.replace(basename, _basename)

    const line = isWindows
      ? `ren '${formatPathWindows(source)}' '${_basename}'`
      : `mv "${source}" "${_source}"`

    console.log(line)
    await $exec(line)
  }

  await Promise.all((await $source([`${path.storage}/*`, `!${path.storage}/*.txt`])).map(sub))
}

const renameNovel = async () => {

  const sub = async (
    source: string,
  ) => {
    const { basename } = $getName(source)
    const _basename = rename(basename)
    if (_basename === basename) return

    await $rename(source, { basename: _basename })
  }

  await Promise.all((await $source(`${path.storage}/*.txt`)).map(sub))
}

const txt2html = async (
  source: string,
): Promise<void> => {

  const { basename } = $getName(source)
  const target = `${path.temp}/${basename}.html`

  const listContent = (
    await $read<string>(source)
  ).split('\n')

  const listResult: string[] = []
  for (let line of listContent) {
    line = line.trim()
    if (!line) continue
    listResult.push(`<p>${line}</p>`)
  }

  const content = html.replace('{{content}}', listResult.join('\n'))
  await $write(target, content)
}

const validateEnvironment = async (): Promise<boolean> => {

  if (!await $isExisted(path.kindlegen)) {
    $info("found no 'kindlegen', run 'brew cask install kindlegen' to install it")
    return false
  }

  if (!await $isExisted(path.document)) {
    $info(`found no '${path.document}', kindle must be connected`)
    return false
  }

  return true
}

// export
export default main