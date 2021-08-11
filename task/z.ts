import $ from 'fire-keeper'

// function

const main = async () => {
  $.info(await $.source([
    '~/OneDrive/书籍/同步/*',
    '!~/OneDrive/书籍/同步/*.txt',
  ]))
}

// export
export default main