# Что нужно для отображения картинок, гифок, видео и аудио в чате? 🤔

> Просто отправь в чат ссылку с поддерживаемым типом файла (Пример: .jpg, .gif, .mp4, .mp3), или перетащи файл со своего компьютера в окно браузера

## Установка

> Установить расширение [«Tampermonkey»](https://www.tampermonkey.net/) для [«Chrome»](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo), [«Edge»](https://microsoftedge.microsoft.com/addons/detail/iikmkjmpaadaobahmlepeloendndfphd), [«Firefox»](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [«Opera»](https://addons.opera.com/en/extensions/details/tampermonkey-beta/), Альтернатива для [«Safari»](https://apps.apple.com/app/userscripts/id1463298887)
>
> Установить [«скрипт»](https://github.com/c0IIwr/Chat-Image-Display/raw/main/Chat-Image-Display.user.js)
>
> Обновить страницу браузера 😁👍

<img  src="https://c0IIwr.github.io/Chat-Image-Display/zapaska-archive.gif">

## Часто задаваемые вопросы

Как скопировать изображение или открыть в новой вкладке?

> Клик левой кнопкой мыши по изображению копирует ссылку в буфер обмена, двойной клик или нажатие средней кнопки мыши открывает ссылку в новом окне

Какие типы файлов поддерживаются?

> Ссылки со следующими форматами отображаются в чате:
> > Для изображений: .jpeg, .jpg, .png, .gif, .gifv, .webp, .avif
> >
> > Для видео: .mp4, .webm, .mov
> >
> > Для аудио: .mp3, .ogg

Как отправить файл со своего компьютера?

> Перетащи медиа файл в любое место окна браузера
> 
> При загрузке, ссылка копируется в буфер обмена _(Для твича отображается как заполнитель, Ctrl+V вставить из буфера)_

На каких стриминговых платформах доступен скрипт?

> На данный момент скрипт работает для сайтов [«VK Play Live»](https://live.vkplay.ru/), [«Boosty»](https://boosty.to/), [«Kick»](https://kick.com/), [«Twitch»](https://www.twitch.tv/), [«GoodGame»](https://goodgame.ru/), [«Trovo»](https://trovo.live/), [«NUUM»](https://nuum.ru/)

Почему Tampermonkey, если скрипт можно добавить в браузер с помощью любого расширения, которое умеет инъектить код в открытые страницы? ([«Пример»](https://chromewebstore.google.com/detail/custom-javascript-for-web/ddbjnfjiigjmcpcpkmhogomapikjbjdk))

> Tampermonkey предлагает ряд преимуществ, включая автоматические обновления скриптов, управление ими через одно удобное расширение, а также широкие возможности настройки. Это делает процесс добавления, управления и обновления скриптов более простым и эффективным, чем при использовании других расширений

## Автообновление

> **Для автообновления Tampermonkey, перейдите:**
> - Панель управления → Настройки → Обновление пользовательских скриптов → Проверять обновления: Каждый день
>
> **Для автообновления скрипта, перейдите:**
> - Установленные скрипты → Chat Image Display → Настройки → Обновления → ✅ Проверять наличие обновлений → Сохранить

<img  src="https://c0IIwr.github.io/Chat-Image-Display/AutoUpdate.gif">

## Список изменений

**v1.0**
- Выпущено

**v1.1**
- Нажатие ЛКМ теперь копирует изображение в буфер обмена
- Ссылка обрезается после расширения файла изображения (полезно для Discord ссылок)

**v1.2**
- Добавлен .webp формат для отображения в чате

**v1.3**
- Добавлен .avif формат для отображения в чате (для 7TV смайлов)
- Добавлен .gifv формат для отображения в чате (для Imgur гифок)
- Курсор изменен на 'pointer' при наведении на изображдение
- Двойной клик теперь открывает изображение в новой вкладке
- Скрипты 'VK Play Chat Image Display' и 'Boosty Chat Image Display' были объединены в один 'Chat Image Display'
- Теперь скрипт автообновляется

**v1.4**
- Исправлен автопрокрут чата (спасибо @shtrih)

**v1.5**
- Добавлен автопрокрут чата Boosty
- Исправлено наложение сообщений чата Boosty друг на друга
- Улучшено отображение границ изображений

**v1.6**
- Добавлена поддержка видео форматов для отображения в чате
- Добавлена поддержка аудио форматов для отображения в чате

**v1.7**
- Добавлена возможность загрузки изображений с компьютера
- Добавлен автолайк для Boosty
- Добавлен автолайк для VK Play Live (дает 100 баллов канала, и поддержку стримера❤️)
- Добавлен автосбор бонусных баллов (если не установлен [«VK Play Tools»](https://chromewebstore.google.com/detail/vk-play-tools/pgcocghliackkooeoiihnkdnbempgjfk))

**v1.8**
- Добавлена поддержка для Kick

**v1.9**
- Добавлена возможность загрузки всех типов файлов с компьютера
- Исправлена ошибка для VK Play Live, когда при переключении на "Учатники" ссылки не отображались в чате
- Добавлена поддержка для Twitch
- Добавлена поддержка для GoodGame
- Добавлена поддержка для Trovo
- Добавлена поддержка для NUUM

**v1.10**
- Исправлен автопрокрут чата для VK Play Live и Boosty

**v1.11**
- Отключено автовоспроизведение звука при наведении на видео/аудио файл

**v1.12**
- Нажатие СКМ теперь открывает медиа файлы в новой вкладке
- Исправлен автолайк для Boosty (из-за изменений на самом бусти)
- Убрано обрезание ссылки после расширения файла изображения (из-за проблем с открытием на некоторых сайтах)

**v1.13**
- Обновление в связи с переездом на новый домен VK Play

**v1.14**
- Улучшен автопрокрут чата
