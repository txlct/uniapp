import { createFilter } from 'vite';
import { parse } from 'es-module-lexer';
import MagicString from 'magic-string';

const formatSemicolon = (source: string) => (
  source.endsWith(';') ? source : `${source};`
);

const handlePre = (source: string, pre: string) => {
  const [imports] = parse(source);
  const end = imports[imports.length - 1]?.se;
  const preString = formatSemicolon(pre);

  return {
    end,
    preString,
  };
};

const handleSource = (code: string, options) => {
  const { pre, post } = options;
  const source = new MagicString(code);

  // uniapp 有前置注入逻辑，import的场景需置于它的业务逻辑之后，即最后第一个import之后，避免执行时序报错
  if (pre) {
    const { end, preString } = handlePre(code, pre);

    if (end) {
      source.appendRight(end + 1, preString);
    } else {
      source.prepend(preString);
    }
  }

  // 后置代码拼接于最后
  post && source.append(formatSemicolon(post));

  return source.toString();
};

export const mainTsPlugin = (
  options: Record<string, string> = {
    pre: '',
    post: '',
  }
) => {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'vite-plugin-main-ts-plugin',
    enforce: 'pre',
    transform(code: string, id: string) {
      const { pre = '', post = '' } = options || {};

      if (!filter(id) || !pre || !post) return;

      return handleSource(code, options);
    }
  };
};