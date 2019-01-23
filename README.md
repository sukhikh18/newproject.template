## Как использовать ##

Сначала качаем и устанавливаем [node.js](https://nodejs.org/en/download/) иначе `npm` работать не будет.
После устанавливаем gulp 'npm install --global gulp'
Запускаем консоль из папки проекта и пишем:

#### Для старта: ####
- `npm install` - установит все необходимые модули

#### После установки запукаем ####
`gulp` - соберет проект, запустит локальный сервер (если не указан domain), установит live-reload

_Так как на данный момент bower.io хостится на запрещенном в России IP 104.27.140.156 по информации с сайта [blocklist.rkn.gov.ru](http://blocklist.rkn.gov.ru/) использовать `bower install` и `gulp install` не обязательно, а скорее всего бесполезно._

## How to use ##

for install:
- `bower install`
- `npm install`*
- `gulp install`

\* - required

use after install:
`gulp` - let's build, start localhost server, set live-reload

tasks:
`gulp install` - initial build (move vendors)

___
Based on html5 boilerplate ver. 6.1.0