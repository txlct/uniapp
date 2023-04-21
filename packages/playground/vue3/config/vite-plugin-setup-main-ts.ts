import { createFilter } from 'vite';


export const setupMainTsPlugin = (options = {
  pre: '',
  post: '',
}) => {
  const filter = createFilter(options.include, options.exclude);

  return {
    name: 'setup-main-ts-plugin',
    enforce: 'pre',
    transform(code: string, id: string) {
      const { pre = '', post = '' } = options;

      if (!filter(id) || (!pre && !post)) return;

      return `${pre}${code}${post}`;
    }
  }
};