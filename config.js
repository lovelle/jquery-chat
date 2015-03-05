var conf =
{
    domain: 'domain.ltd',
    server_type: 'socket.io',
    server: 'jquery-chat.herokuapp.com',
    port: '80',
    debug: true,
    auto_login: false,
    sound_active: true,
    login_popup: true,
    tools_disabled: false,
    tools:
    {
        icon: 'ui-icon-wrench'
    },

    options_disabled: false,
    options:
    {
        icon: 'ui-icon-triangle-1-n'
    },

    bar:
    {
        default_expand: true,
        icon_expand: 'ui-icon-arrowthickstop-1-e',
        icon_collapse: 'ui-icon-arrowthickstop-1-w'
    },

    theme_default: 'smoothness',
    themes:
    [
        { name: 'black-tie' },
        { name: 'blitzer' },
        { name: 'cupertino' },
        { name: 'dark-hive' },
        { name: 'dot-luv' },
        { name: 'eggplant' },
        { name: 'excite-bike' },
        { name: 'flick' },
        { name: 'hot-sneaks' },
        { name: 'humanity' },
        { name: 'le-frog' },
        { name: 'mint-choc' },
        { name: 'overcast' },
        { name: 'pepper-grinder' },
        { name: 'redmond' },
        { name: 'south-street' },
        { name: 'start' },
        { name: 'sunny' },
        { name: 'swanky-purse' },
        { name: 'trontastic' },
        { name: 'ui-darkness' },
        { name: 'ui-lightness' },
        { name: 'vader' }
    ],

    lang_default: 'en', //Default selected lang in 'options', for change current language go to script tag in 'index.html'.
    lang:
    [
        {
            text: 'Spanish',
            i18n: 'es'
        },
        {
            text: 'English',
            i18n: 'en'
        }
    ],

    shortcuts:
    [
        {
            text: 'Home',
            href: 'https://github.com/lovelle/jquery-chat/',
            icon: 'ui-icon-home',
            target: '_blank'
        },
        {
            text: 'Mail',
            href: 'https://gmail.com/',
            icon: 'ui-icon-mail-closed',
            target: '_blank'
        },
        {
            text: 'Search',
            href: 'https://google.com/',
            icon: 'ui-icon-search',
            target: '_blank'
        }
    ]
}
