import postCssPurge from '@fullhuman/postcss-purgecss';

const vuePath = /\.vue(\?.+)?$/;

export default {
  plugins: [ postCssPurge({ contentFunction, defaultExtractor }) ]
}

function contentFunction (sourceInputFile) {
  if (vuePath.test(sourceInputFile))
    return [sourceInputFile.replace(vuePath, '.vue')];

  return ['src/**/*.vue', 'index.html'];
}

function defaultExtractor(content) {
  if (content.startsWith('<template'))
    content = content.split('</template')[0] + '</template>';

  return content.match(/[\w-/:]+(?<!:)/g) || [];
}