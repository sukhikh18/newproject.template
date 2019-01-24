﻿## Как использовать ##

Сначала качаем и устанавливаем [node.js](https://nodejs.org/en/download/) иначе `npm` работать не будет.

Скачиваем или клонируем репозиторий `git clone https://github.com/nikolays93/newproject.boilerplate.git`
([git](https://git-scm.com/download) клиент должен быть установлен)

Клонируем шаблон-подмодуль. Для этого выполняем `clone-submodule.sh` (Проверено из win10)
или клонируем/скачиваем `git clone https://github.com/nikolays93/newproject.template`

После устанавливаем gulp `npm install --global gulp`

Запускаем консоль из папки проекта и пишем:

#### Для старта\*: ####
`npm install` - установит все необходимые модули

#### После установки запукаем ####
`gulp` - соберет проект, запустит локальный сервер (если не указан domain), установит live-reload

_\* Так как на данный момент bower.io хостится на запрещенном в России IP 104.27.140.156 по информации с сайта [blocklist.rkn.gov.ru](http://blocklist.rkn.gov.ru/) использовать `bower install` и `gulp install` не обязательно, а скорее всего бесполезно._
____
За основу взят шаблон [html5 boilerplate](https://github.com/h5bp/html5-boilerplate) (вер. 6.1.0)

## How to use ##

for install:
- `bower install`
- `npm install`*
- `gulp install`

__\* - required__

#### tasks: ####
`gulp` - let's build, start localhost server, set live-reload
`gulp install` - initial build (move vendors)

___
Based on [html5 boilerplate](https://github.com/h5bp/html5-boilerplate) ver. 6.1.0