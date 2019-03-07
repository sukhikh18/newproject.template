# New project Boilerplate

## Особенности
- автоматическая перезагрузка страницы в браузере с использованием [Browsersync](https://www.browsersync.io/);
- использование препроцессора [SCSS](https://sass-lang.com/);

## Установка
1. Установите [node.js](https://nodejs.org/en/download/).
2. Установите [Yarn](https://yarnpkg.com/en/docs/install/).
3. Установите [Gulp](https://gulpjs.com) глобально: ```yarn global add gulp-cli```.
4. Рекомендую так же установить [git-scm](https://git-scm.com) для клонирования репозиториев к себе на компьютер командой ```git clone```.

## Как пользоваться
* Клонируйте репозиторий ```git clone https://github.com/nikolays93/newproject.boilerplate.git``` или скачайте сборку из этого репозитория и распакуйте [шаблон](https://github.com/nikolays93/newproject.template/) в public_html сборки;
* Перейдите к скачаной папке командой ```cd newproject.boilerplate``` или откройте консоль в папке скачанной сборки;
* Введите команду ```yarn``` для установки/сборки проекта;
* Введите ```yarn run dev``` или ```gulp``` для разработки;
* Введите ```yarn run prod``` или ```gulp build --production``` для завершения разработки;

## Плагины
* [browser-sync](https://browsersync.io/docs/gulp) - живая перезагрузка веб-страницы при внесении изменений в файлы вашего проекта;
* [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer) — автоматически расставляет вендорные префиксы в CSS в соответствии с сервисом [Can I Use](https://caniuse.com/);
* [gulp-uglify](https://www.npmjs.com/package/gulp-uglify) — минификация JS-файлов;
* [gulp-sass](https://www.npmjs.com/package/gulp-sass) — компиляция SCSS в CSS;
* [gulp-group-css-media-queries](https://www.npmjs.com/package/gulp-group-css-media-queries) - группировка ```@media```;
* [gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css) — минификация CSS-файлов;
* [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) - карта стилей;
* [gulp-rename](https://www.npmjs.com/package/gulp-rename) — переименование файлов, добавление суффиксов и префиксов (например, добавление суффикса ```.min``` к минифицированным файлам);
* [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) — сжатие изображений PNG, JPG, GIF и SVG (включая дополнительные плагины для оптимизации);
* [gulp-if](https://www.npmjs.com/package/gulp-if) - запуск заданий только тогда, когда это нужно;
* [gulp-replace](https://www.npmjs.com/package/gulp-replace) - замена строк;
* [gulp-rigger](https://www.npmjs.com/package/gulp-rigger) - позволяет вставлять содержимое из отдельных файлов в основной;
* [gulp-plumber](https://www.npmjs.com/package/gulp-plumber) — оповещения в командной строке (например, ошибки в SCSS/Sass);
* [gulp-debug](https://www.npmjs.com/package/gulp-debug) — отладка в терминале;
* [gulp-watch](https://www.npmjs.com/package/gulp-watch) — отслеживание изменений в ваших файлах проекта;
* [gulp-clean](https://www.npmjs.com/package/gulp-clean) — удаление файлов и папок;
* [gulp-newer](https://www.npmjs.com/package/gulp-newer) - пропуск повторной обработки;
* [yargs](https://www.npmjs.com/package/yargs) - получение аргументов командной строки в Node.js.

___
За основу взят сборщик [gulp-scss-starter](https://github.com/andreyalexeich/gulp-scss-starter) от [Андрея Горохова](https://github.com/andreyalexeich)
