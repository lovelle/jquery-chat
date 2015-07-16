// A 100% javascript facebook/gmail style web chat.
// (c) 2014-2015 Ezequiel Lovelle [ezequiellovelle@gmail.com]
// released under the MIT license

(function( $ ) {
  
  var chat_stat = 0,
  chat_reconnect = 0,
  chat_num_users = 0,
  chat_title_status = 2,
  chat_changed_lang = true,
  user_email,
  user_name,
  user_avatar,
  socket;

  var conf_domain,
  conf_server_type,
  conf_server,
  conf_port,
  conf_auto_login,
  conf_debug,
  conf_sound_active,
  conf_login_popup,
  conf_tools_disabled,
  search_case_sensitive,
  conf_tools_icon,
  conf_options_disabled,
  conf_options_icon,
  conf_bar_default_expand,
  conf_bar_icon_expand,
  conf_bar_icon_collapse,
  conf_theme_default,
  conf_themes,
  conf_lang_default,
  conf_lang_text,
  conf_lang_i18n,
  conf_shortcuts_text,
  conf_shortcuts_href,
  conf_shortcuts_icon,
  conf_shortcuts_target;

  var xhr_dlogin = $.get( "views/dialog-login.html", function( dialog_login ) {
    $( "body" ).append( dialog_login );
  });

  var xhr_toolbar = $.get( "views/toolbar.html", function( toolbar ) {
    $( "body" ).append( toolbar );
  });
  
  var xhr_mchat = $.get( "views/main-chat.html", function( main_chat ) {
    $( "body" ).append( main_chat );
  });

  var xhr_options = $.get( "views/options.html", function( options ) {
    $( "body" ).append( options );
  });

  $.when( xhr_dlogin, xhr_toolbar, xhr_mchat, xhr_options ).done(function(r1, r2, r3, r4) {

    main_set_conf();
    main_set_i18n();
    main_set_theme( conf_theme_default );
    
    if ( conf_tools_disabled == false ) {
      //Show button
      $( "#tools" ).removeClass( "no-display" );
      
      //Tools icon and title for 
      $( "#tools-icon" ).addClass( conf_tools_icon );

      //Tools shortcuts
      for ( var i = 0; i < conf["shortcuts"].length; i++ )
        $( "#tools-menu" ).append( "<li><a href='" + conf_shortcuts_href[i] + "' target='" + conf_shortcuts_target[i] + "'><span class='ui-icon " + conf_shortcuts_icon[i] + "'></span>" + conf_shortcuts_text[i] + "</a></li>" );
    }

    if ( conf_options_disabled == false ) {
      //Show button
      $( "#options" ).removeClass( "no-display" );

      //Options icon and title
      $( "#options-icon" ).addClass( conf_options_icon );

      //Themes for options
      $( "#theme-custom" ).append( "<option value='" + conf_theme_default + "' selected>" + conf_theme_default + "</option>" );
      for ( var i = 0; i < conf["themes"].length; i++ )
        $( "#theme-custom" ).append( "<option value='" + conf_themes[i] + "'>" + conf_themes[i] + "</option>" ) ;

      //Lang for options
      for ( var i = 0; i < conf["lang"].length; i++ )
        if (conf_lang_i18n[i] == conf["lang_default"])
          $( "#i18n" ).append( "<option value='" + conf_lang_i18n[i] + "' selected='selected'>" + conf_lang_text[i] + "</option>" );
        else
          $( "#i18n" ).append( "<option value='" + conf_lang_i18n[i] + "'>" + conf_lang_text[i] + "</option>" );
    }

    //Main chat title bar
    main_chat_status( i18n.disconnected, "offline" );
    
    //0 chat users at begining
    main_chat_users_num( 2, 0 );

    if (!conf_search_case_sensitive) {
      jQuery.expr[":"].Contains = jQuery.expr.createPseudo(function(arg) {
          return function( elem ) {
              return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
          };
      });
    }
    
    //Init state of bar, collapse or expand
    if ( conf_bar_default_expand == false ) {
      $( "#main" ).addClass( "toolbar" );
      $( "#main-rpanel" ).addClass( "window" );
      $( "#slide-bar-span" ).toggleClass( conf_bar_icon_collapse );
      $( "#slide-bar" ).attr( "title", i18n.expand );
    } else {
      $( "#main" ).addClass( "toolbar-max" );
      $( "#main-rpanel" ).removeClass( "window" );
      $( "#slide-bar-span" ).toggleClass( conf_bar_icon_expand );
      $( "#slide-bar" ).attr( "title", i18n.collapse );
    }

    $( "#tools, #options, #slide-bar" ).tipsy({ fade: true, gravity: $.fn.tipsy.autoBounds( 150, "s" ) });
    $( "#tools, #options, #slide-bar, #chat-title-button" ).button();

    //Click for expand and collapse
    $( document ).on("click", "#slide-bar", function() {
      $( this ).tipsy( "hide" );
      $( "#main" ).toggleClass( "toolbar toolbar-max" );
      $( "#main-rpanel" ).toggleClass( "window" );
      $( "#slide-bar-span" ).toggleClass( conf_bar_icon_expand );
      $( "#slide-bar-span" ).toggleClass( conf_bar_icon_collapse );
      
      //if expand button has been click and is the tool popup open, then close it
      if ( $( "#tools-panel" ).dialog( "isOpen" ) == true )
        $( "#tools-panel" ).dialog( "close" );

      if ( $( "#main-rpanel" ).hasClass( "window" ) )
        $( this ).attr( "title", i18n.expand );
      else
        $( this ).attr( "title", i18n.collapse );

      return false;
    });

    //Dialog tools menus
    $(function() {
      $( "#tools-menu" ).menu();
      $( "#tools-panel" ).dialog({
        autoOpen: false,
        resizable: false,
        modal: false,
        minHeight: 100,
        maxHeight: 250,
        width: "auto",
        height: "auto",
        open : function() { $( this ).dialog( "option" , "title" , i18n.tools); },
        position: {
          my: "left bottom",
          at: "left top",
          collision: "flip, none",
          of: "#main"
        },
        show: {
          effect: "clip",
          duration: 500
        },
        hide: {
          effect: "clip",
          duration: 500
        }
      });

      //Dialog options menus
      $( "#options-accordion" ).accordion({
        collapsible: false,
        heightStyle: "fill"
      });
      $( "#format" ).buttonset();
      $( "#options-panel" ).dialog({
        autoOpen: false,
        resizable: false,
        modal: false,
        //width: "auto",
        //height: "auto",
        open : function() { $( this ).dialog( "option" , "title" , i18n.options); },
        position: {
          my: "right bottom",
          at: "right top",
          collision: "flip, none",
          of: "#main"
        },
        show: {
          effect: "clip",
          duration: 500
        },
        hide: {
          effect: "clip",
          duration: 500
        }
      });

      var name = $( "#name" ),
        email = $( "#email" ),
        allFields = $( [] ).add( name ).add( email ),
        tips = $( ".validateTips" );

      function updateTips( t ) {
        tips
          .text( t )
          .addClass( "ui-state-highlight" );
        setTimeout(function() {
          tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
      }
   
      function checkLength( o, n, min, max ) {
        if ( o.val().length > max || o.val().length < min ) {
          o.addClass( "ui-state-error" );
          updateTips( i18n.length_of +" " + n + " "+ i18n.must_be_between + " " +
            min + " " + i18n.and + " " + max + "." );
          return false;
        } else {
          return true;
        }
      }
   
      function checkRegexp( o, regexp, n ) {
        if ( !( regexp.test( o.val() ) ) ) {
          o.addClass( "ui-state-error" );
          updateTips( n );
          return false;
        } else {
          return true;
        }
      }

      $( "#dialog-login" ).dialog({
        autoOpen: false,
        resizable: false,
        width: 350,
        modal: true,

        buttons: [
          {
            text: i18n.login,
            click: function() { 
              var bValid = true;
              allFields.removeClass( "ui-state-error" );
     
              bValid = bValid && checkLength( name, "username", 3, 16 );
              bValid = bValid && checkLength( email, "email", 6, 80 );
     
              bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_\ ])+$/i, i18n.validate_username );
              // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
              bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. user@example.com" );
     
              if ( bValid ) {
                user_email = email.val();
                user_name  = name.val();
                $( this ).dialog( "close" );
                //Open chat
                $( "#chat-title-button" ).trigger( "click" );
              }
            }
          },
          {
            text: i18n.cancel,
            click: function() { $( this ).dialog( "close" ); }
          }
        ],

        close: function() {
          allFields.val( "" ).removeClass( "ui-state-error" );
        }
      });

      //Click for open dialog tools menus
      $( document ).on("click", "#tools", function() {
        main_do_dialog ( this, "#tools-panel" );
      });

      //Click for open dialog options menus
      $( document ).on("click", "#options", function() {
        main_do_dialog ( this, "#options-panel" );
        $( "#options-accordion" ).accordion( "refresh" );
      });
    });

    //Open new chat
    $( document ).on("click", ".user-button", function() {
      var prefix = "user-button-";
      var iduser = $( this ).attr( "id" ).substring( (prefix.length) );
      var name   = $( this ).text();

      // Del notification if exist
      main_chat_user_alert( iduser, 1 );

      if ( name.length > 15 ) {
        var length = 15;
        var name   = name.substring( 0, length );
        name = name + "...";
      }

      open_chat_box ( iduser, name );
      //Set position
      $( "#Dialog" + iduser ).dialog( "option", "position", { my: "right bottom", at: "right top-3", of: this, collision: "flip, none" });
    });

    //New user connected!!!
    $( document ).on("click", ".button-user", function() {
      var userid = $( this ).attr( "id" );
      var status = $( this ).attr( "status" );
      var name = $( this ).text();

      //Append the Dialogid
      main_append_dialog( userid );
      main_set_dialog( userid );

      //Append the user to chat
      main_chat_user_new( userid, status, name );
    });

    //Custom message
    //TODO: Put in the init
    var text_status = i18n.custom_message;
    var text_custom_msg = "";
    var text_custom_msg_last;
    $( "#text-status" ).val( text_status ).button({});

    $( "#users" ).accordion({
      collapsible: false,
      icons: { header: "ui-icon-circle-arrow-e", activeHeader: "ui-icon-circle-arrow-s" },
      heightStyle: "fill"
    });

    $( "#main-users-resizer" ).resizable({
      handles: "n, w",
      minHeight: 200,
      minWidth: 200,

      create: function() { main_chat_set_position( 0 ); },
      resize: function() { $( "#users" ).accordion( "refresh" ); }
    });

    //Main hide
    $( "#main-users-resizer" ).hide();
    $( "#main-sort-chat" ).sortable().disableSelection();

    //Mouse over-out effect of user
    $( document ).on("mouseover", ".user", function() {
      var id = $( this ).attr( "id" );
      $( "#" + id ).addClass( "ui-state-default" );
    });
    $( document ).on("mouseout", ".user", function() {
      var id = $( this ).attr( "id" );
      $( "#" + id ).removeClass( "ui-state-default" );
    });

    //Click in user in chat box
    $( document ).on("click", ".user", function() {
      //Do nothing if user is offline
      if ( $( this ).hasClass( "offline" ) )
        return false;

      var prefix = "user-";
      var iduser = $( this ).attr( "id" ).substring( (prefix.length) );

      //Append div user in the bar if is not appended
      if ( $( "#users-button-bar" ).parent().find( "#user-button-" + iduser ).length == 0 ) {
        var name = $( this ).text();
        var stat = $( this ).find( "li" ).attr( "class" );
        $( "#users-button-bar" ).append( "<button id='user-button-" + iduser + "' class='user-button' style='font-size: 65%;'><li class='" + stat + "'>" + name + "</li></button>" );
        $( ".user-button" ).button();
      }

      //Do the same as clicking the user in the bar
      $( "#user-button-" + iduser ).trigger( "click" );

      return false;
    });

    //Search
    $( "#chat-icon-search" ).button({
      icons: {
        primary: "ui-icon-search"
      },
      text: false
    });
    $( "#chat-search-text" ).button()
      .next()
        .button({
          text: false,
          icons: {
            primary: "ui-icon-close"
          }
        }).parent().buttonset();

    //Search the user
    $( document ).on("keyup", "#chat-search-text", function() {
      $( this ).val( $( this ).val().replace(/[^A-Za-z ]/g, '') );
      if ( $( this ).val().length >= 2 ) {
        var filter = $( this ).val();
        $( "#main-sort-chat" ).find( "a:not(:Contains(" + filter + "))" ).parent().slideUp().parent().hide();
        $( "#main-sort-chat" ).find( "a:Contains(" + filter + ")" ).parent().slideDown().parent().show();
        
        //If no user are found, display warning
        if ( $( "#main-sort-chat" ).find( "a:not(:Contains(" + filter + "))" ).length == chat_num_users ) {
          if ( $( "#no-users-found" ).length == 0 && chat_num_users > 0 )
            $( "#main-sort-chat" ).append( "<div id='no-users-found'>" + i18n.user_not_found + "</div>" );
        } else {
          if ( $( "#no-users-found" ).length > 0 )$( "#no-users-found" ).remove();
        }
      } else {
        $( "#main-sort-chat" ).find( "li" ).slideDown().parent().show();
        if ( $( "#no-users-found" ).length > 0 )$( "#no-users-found" ).remove();
      }

      return false;
    });

    //Button close search for clean it
    $( document ).on("click", "#chat-icon-close", function() {
      $( "#chat-search-text" ).val( "" );
      $( "#main-sort-chat" ).find( "li" ).slideDown().parent().show();
      if ( $( "#no-users-found" ).length > 0 )$( "#no-users-found" ).remove();
      return false;
    });

    //Bar text button open chat
    $( document ).on("click", "#chat-title-button", function() {

      if ( chat_stat == 0 ) {
        
        if (!user_name || !user_email) {
          $( "#dialog-login" ).dialog( "open" );
          return false;
        }
        
        main_chat_init();

        socket_connect();
        socket_handle();
        
        //TODO: alert( "do init connection" );
        //if connection was 'ok' then append the main chat
        //if connection was 'ok' then change chat title bar to online
      }

      $( "#main-users-resizer" ).toggle();
      //Set the position every time chat button is clicked
      main_chat_set_position( 0 );
    });
    
    //Menu states
    $( "#rerun" )
      .button()
      .click(function() {
        console.log( "user status" );
      })
      .next()
        .button({
          text: false,
          icons: { primary: "ui-icon-triangle-1-s" }
        })
        .click(function() {
          var menu = $( this ).parent().next().show().position({
            my: "left top",
            at: "left bottom",
            of: this
          });
          $( document ).one( "click", function() {
            menu.hide();
          });
          return false;
        })
        .parent()
          .buttonset()
          .next()
            .hide()
              .menu();
    
    //User status
    $( document ).on("click", ".user-status", function() {
      var id = $( this ).attr( "id" );
      var now = $( "#rerun-img" ).attr( "src" );
      var status, label;

      if ( id == "user-status-online" && now != "images/button_online.png" ) {
        status = "online";
        label  = i18n.connected;
      }

      else if ( id == "user-status-busy" && now != "images/busy.png" ) {
        status = "busy";
        label  = i18n.busy;
      }

      else if ( id == "user-status-offline" && now != "images/button_offline.png" ) {
        status = "offline";
        label  = i18n.offline;
      }

      //TODO: change image
      else if ( id == "user-status-logout" ) {
        main_chat_disconnect();
        return true;
      }

      else
        return false;

      main_chat_status( label, status );
      user_status( "user_status", status );
    });


    //Minus icon in main chat
    $( document ).on("click", "#min-main-chat", function() {
      $( "#main-users-resizer" ).hide();
    });

    //User status msg
    $( document ).on("focusin", "#text-status", function() {
      if ( text_custom_msg.length < 1 )
        $( this ).val("");
      else
        $( this ).val( text_custom_msg );

      return false;
    });
    $( document ).on("focusout", "#text-status", function() {
      if ( text_custom_msg.length < 1 )
        $( this ).val( text_status );
      else
        $( this ).val( text_custom_msg );

      return false;
    });

    //If enter key is pressed on custom message
    $( document ).on("keydown", "#text-status", function(e) {
      if ( (e.which == 13) ) {
        if ( $( this ).val().length < 1 ) {
          $( this ).val( text_status );
          text_custom_msg = "";
        } else
          text_custom_msg = clean_msg ( $( this ).val() );

        if ( text_custom_msg_last != text_custom_msg ) { 
          user_status( "user_status_msg", text_custom_msg );
        }

        text_custom_msg_last = text_custom_msg;
        $( this ).blur();
        return false;
      }
    });

    //Change text for lang
    function main_chat_set_dialog_lang ( dialogid ) {
      dialogid.parent().find( "#warning-alert" ).text( i18n.alert + " " );//Set text 'alert'
      dialogid.parent().find( "#warning-text" ).text( i18n.user_is + " " + i18n.disconnected.toLowerCase() );//Set text 'user is offline'
      dialogid.parent().find( "#iswriting-text" ).first().text( clean_name( dialogid.data( "name" ) ) + " " + i18n.is_writing );//Set text 'is writing...' 
      dialogid.parent().find( ".minimize-window" ).attr( "title", i18n.minimize );
      dialogid.dialog( { closeText: i18n.close } );
      chat_changed_lang = false;
    }

    //Box Dialog for new user
    function main_set_dialog ( id, user ) {

      $( "#Dialog" + id ).dialog({
        autoOpen: false,
        closeOnEscape: true,
        resizable: false,
        modal: false,
        minHeight: 200,
        maxHeight: 400,
        height: "auto",
        width: 280,

        open: function(event, ui) {

          //Set language in Dialog and init
          if ( chat_changed_lang == true )
            main_chat_set_dialog_lang( $( this ) );

          if ( $( this ).data( "init" ) != 1 ) {

            //Save the top of dialog
            var main = $( this );
            var name = main.data( "name" );

            //Change text for the default lang
            main_chat_set_dialog_lang( main );

            //Extern window button
            //main.parent().find( ".ui-dialog-titlebar" ).append( "<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only externally-window' role='button' aria-disabled='false' title='Ventana externa'><span class='ui-icon ui-icon-arrowthick-1-nw'></span><span class='ui-button-text'>Ventana externa</span></button>" );
            //Min button
            main.parent().find( ".ui-dialog-titlebar" ).append( "<button class='ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only minimize-window' role='button' aria-disabled='false' title='" + i18n.minimize + "'><span class='ui-icon ui-icon-minus'></span></button>" );
            //Status icon
            main.parent().find( ".ui-dialog-title" ).append( "<li id='dialog-status' class='" + main.data( "status" ) + "'>" + name + "</li>" );

            //Set hide 'is writing...'
            main.parent().find( "#iswriting" ).first().addClass( "no-display" );

            //Change flag at init option
            main.data( "init", 1 );

            //Textarea click
            main.parent().find( "textarea" ).click(function() {
              main_chat_user_alert( id, 1 );
            });

            //Textarea focus fancy in and out
            main.parent().find( "textarea" ).first().focusin(function() {
              main.addClass( "ui-chatbox-input-focus" );
            });
            $( this ).parent().find( "textarea" ).first().focusout(function() {
              main.removeClass( "ui-chatbox-input-focus" );
            });

            //Minimize button
            main.parent().find( ".minimize-window" ).click(function() {
              main.dialog( "close" );
            });

            //Fancy scrollbar
            new_scroll(main.parent().find( ".direct-chat-messages" ));

            //Close button
            main.parent().find( ".ui-dialog-titlebar-close" ).click(function() {
              var iduser = main.attr( "id" ).substring( ( "Dialog".length ) );
              $( "#user-button-" + iduser ).remove();
            });

            var typingTimeout;
            //Textarea send form when key enter is pressed
            main.find( "textarea" ).first().keyup(function( e ) {

              if (typingTimeout !== undefined) clearTimeout(typingTimeout);
              typingTimeout = setTimeout(function() { call_user_is_writing(user) }, 400);

              //Progressbar of char in textarea
              main.parent().find( "#progressbar-char" ).progressbar( "option", "value", $( this ).val().length );
              if ( $( this ).val().length > 100 ) {
                var remove_excess = $( this ).val().substr(0, 100);
                $( this ).val( remove_excess );
              }

              //Intro event
              if ( (e.which == 13) && !event.shiftKey ) {
                var msg = clean_msg ( $( this ).val() );
                $( this ).val( "" );
                if (msg !== "") {
                  main.parent().find( "#progressbar-char" ).progressbar( "option", "value", 0 );
                  socket.emit('message', { 'user': user, 'msg': msg }, function (data) {
                    var recv = JSON.parse(data);
                    append_msg_me(msg, main, recv.date);
                    // FIXME
                    // Set dialog position
                    main.dialog( "option", "position", { my: "right bottom", at: "right top-3", of: "#user-button-"+id, collision: "flip, none" });
                  });
                }
              }
              return false;
            });

            //Init char progress bar
            $( this ).find( "#progressbar-char" ).first().progressbar({ value: 0 });
          }

          //Go to bottom
          new_scroll($( this ).parent().find( ".direct-chat-messages" ));
        },
      
        show: {
          effect: "none"
        },
        hide: {
          effect: "none"
        }
      });
    }

    function call_user_is_writing(user) {
      socket.emit('user_typing', { 'user': user });
    }

    //Socket emit send data
    function user_status ( action, data ) {
      // TODO: user_status_msg
      if (action == 'user_status')
        socket.emit('user_status', { 'status': data });
    }

    //Clean text received
    function clean_msg ( text ) {
      //Clean html tags
      var msg_html = text.replace( /(<([^>]+)>)/ig,"" );
      //Clean html tabs and new line
      var msg_done = msg_html.replace(/(\n|\r|\r\n)$/, '');
      return msg_done;
    }

    function minhour(d) {
      var hour = d.getHours();
      var mins = d.getMinutes();
      var ampm = " pm";

      if( hour < 10 ) { hour = "0" + hour; }
      if( hour < 12 ) { ampm = " am"; }
      if( mins < 10 ) { mins = "0" + mins; }

      var r = hour + ":" + mins + ampm;
      return r;
    }

    function get_format_date(date) {
      var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
      var d = new Date(date);
      var day = d.getDay();
      var month = d.getMonth();
      var r = day + " " + monthNames[month] + " " + minhour(d);
      return r
    }

    // Append my messages
    function append_msg_me ( msg, main, date ) {
      var box = main.parent().find(".box-body");
      var me = box.find('.direct-chat-messages').last();
      var scroll = main.parent().find( ".direct-chat-messages" );

      if (me.children().last().attr('id') == 'me') {
        me.children().find('.direct-chat-text').last().append("<div>" + msg + "</div>")
      } else {
        me.append("\
          <div class='direct-chat-msg right' id='me'>\
            <div class='direct-chat-info clearfix'>\
              <span class='direct-chat-name pull-right'>" + user_name + "</span>\
              <span class='direct-chat-timestamp pull-left'>" + get_format_date(date) + "</span>\
            </div>\
            <img class='direct-chat-img' src='" + user_avatar + "' alt='message user image' />\
            <div class='direct-chat-text'>\
              <div>" + msg + "</div>\
            </div>\
          </div>");
      };

      // Go to bottom
      new_scroll(scroll);
    }

    function append_msg_he ( msg, main, name, date, avatar ) {
      var fullname = '';
      var fname = name.split(' ');
      var box = main.parent().find(".box-body");
      var he = box.find('.direct-chat-messages').last();
      var scroll = main.parent().find( ".direct-chat-messages" );

      if (fname.length == 2) fullname = fname[0] + " " + fname[1];
      else fullname = fname[0];

      if (he.children().last().attr('id') == 'he') {
        he.children().find('.direct-chat-text').last().append("<div>" + msg + "</div>")
      } else {
        he.append("\
          <div class='direct-chat-msg' id='he'>\
            <div class='direct-chat-info clearfix'>\
              <span class='direct-chat-name pull-left'>" + fullname + "</span>\
              <span class='direct-chat-timestamp pull-right'>" + get_format_date(date) + "</span>\
            </div>\
            <img class='direct-chat-img' src='" + avatar + "' alt='message user image' />\
            <div class='direct-chat-text'>\
              <div>" + msg + "</div>\
            </div>\
          </div>");
      };

      // Go to bottom
      new_scroll(scroll);
    }

    function new_scroll(s) {
      var sint = s.prop('scrollHeight') + 'px';
      s.slimScroll({
        size: '5px',
        scrollTo : sint,
        height: 'auto',
        start: 'bottom'
      });
    }

    //Function for Open chat box
    function open_chat_box ( iduser, name ) {
      if ( $( "#Dialog" + iduser ).dialog( "isOpen" ) == false ) {
        //Close all dialogs
        $( ".ui-dialog-content" ).dialog( "close" );
        $( "#Dialog" + iduser ).data( "name", name );
        $( "#Dialog" + iduser ).dialog( "open" );
      } else
        $( "#Dialog" + iduser ).dialog( "close" );
    }

    //Debug errors with alert
    if ( conf_debug == true ) {
      window.onerror = function( msg, url, linenumber ) {
        alert( "Error: " + msg + "\nUrl: " + url + "\nLine: " + linenumber );
        return true;
      }
    }

    $( document ).ready(function() {
      //Open chat by default on page ready
      if ( conf_auto_login == true )
        $( "#chat-title-button" ).trigger( "click" );
    });

    //Set position on resize of the window
    $( window ).resize(function() {
      set_position();
    });

    function clean_name( text ) {
      var text_arr = text.split(" ");
      if ( text_arr[0].length > 9 )
        text_arr[0] = text_arr[0].substr(0, 8) + "..";
      
      return text_arr[0]
    }

    function main_chat_status ( text , status ) {
      //TODO:
      //if was discconected, do reconnect
      if ( chat_reconnect == 1 ) {
        socket_reconnect();
      }

      if ( status == "online" )
        $( "#rerun-img" ).attr( "src", "images/button_online.png" );
      else if ( status == "busy" )
        $( "#rerun-img" ).attr( "src", "images/busy.png" );
      else if ( status == "offline" )
        $( "#rerun-img" ).attr( "src", "images/button_offline.png" );

      $( "#chat-title-button" ).find( "li" ).first().text( i18n.chat + " (" + text + ") " );
      $( "#chat-title-button" ).find( "li" ).first().removeClass().addClass( status );
    }

    function main_chat_init () {
      //Just in case, close dialogs open
      $( ".ui-dialog-content" ).dialog( "close" );

      //Set accordion property in init
      $( "#users" ).accordion( "refresh" );

      chat_stat = 1;
    }

    function main_chat_set_position ( pos ) {
      //pos = 0, set position
      //pos = 1, increment main chat and set position
      //pos = 2, decrement main chat and set position
      if ( pos > 0 ) {
        //Increment overall height for add the new user
        var height_main_users_resizer = $( "#main-users-resizer" ).height() + 2;
        var height_main_sort_chat = $( "#main-sort-chat" ).height();
        var height_users_window_chat = $( "#users-window-chat" ).height();

        if ( height_main_users_resizer < 600 && height_main_sort_chat > height_users_window_chat ) {

          if ( pos == 1 )
            var newheight = height_main_users_resizer + height_main_sort_chat - height_users_window_chat;
          else if ( pos == 2 )
            var newheight = height_main_users_resizer - height_main_sort_chat - height_users_window_chat;
          else
            alert( "main_chat_set_position() unexpected value '" + pos + "', please report this" );

          if ( newheight < 600 ) {
            $( "#main-users-resizer" ).css( "height", newheight );
            $( "#users" ).accordion( "refresh" );
          }
        }
      }
      $( "#main-users-resizer" ).position({ my: "right bottom", at: "right top", of: "#main", collision: "flip, none" });
    }

    // Delete the user in main chat, but in message box, 
    // you must be able to read the conversation
    function main_chat_user_offline_new ( id ) {
      //Display warning
      $( "#Dialog" + id ).parent().find( "#warning" ).first().removeClass( "no-display" );
      //Disable send msg
      $( "#Dialog" + id ).parent().find( "#textarea_msg" ).first().attr( "disabled", "disabled" );

      //if ( has scroll )
      //BUG!!!
      var height = 180 - $( "#Dialog" + id ).parent().find( "#warning" ).height() - 2;
      //Now the height of the box is smaller
      $( "#Dialog" + id ).parent().find( "#box" ).first().css( "max-height", height );

      //Change li status to offline
      main_chat_user_status( id, "offline" );

      $( "#main-sort-chat" ).find( "#user-"+id ).remove();

      //Decrease total number of current users
      main_chat_users_num( 1, 0 );

      //Add label of no users connected
      if ( chat_num_users == 0 )
        if ( $( "#chat-main-title-label" ).length == 0 )
          $( "#main-sort-chat" ).append( "<div id='chat-main-title-label'>" + i18n.no_users + "</div>" );

      //Decrease total chat main heigh for the new user
      main_chat_set_position( 2 );
    }

    function main_chat_user_offline ( id ) {
      //Display warning
      $( "#Dialog" + id ).parent().find( "#warning" ).first().removeClass( "no-display" );
      //Disable send msg
      $( "#Dialog" + id ).parent().find( "#textarea_msg" ).first().attr( "disabled", "disabled" );

      //if ( has scroll )
      //BUG!!!
      var height = 180 - $( "#Dialog" + id ).parent().find( "#warning" ).height() - 2;
      //Now the height of the box is smaller
      $( "#Dialog" + id ).parent().find( "#box" ).first().css( "max-height", height );

      //Change li status to offline
      main_chat_user_status( id, "offline" );
    }

    function main_chat_user_delete ( id ) {
      $( "#main-sort-chat" ).find( "#user-"+id ).remove();
      $( "#user-button-" + id ).remove();
      $( "#Dialog" + id ).remove();

      //Decrease total number of current users
      main_chat_users_num( 1, 0 );

      //Add label of no users connected
      if ( chat_num_users == 0 )
        if ( $( "#chat-main-title-label" ).length == 0 )
          $( "#main-sort-chat" ).append( "<div id='chat-main-title-label'>" + i18n.no_users + "</div>" );

      //Decrease total chat main heigh for the new user
      main_chat_set_position( 2 );
    }

    function main_chat_user_status ( id, status ) {
      $( "#user-" + id ).find( "li" ).removeClass().addClass( status );
      $( "#user-button-" + id ).find( "li" ).removeClass().addClass( status );
      $( "#Dialog" + id ).parent().find( "#dialog-status" ).removeClass().addClass( status );
      $( "#Dialog" + id ).data( "status", status );
    }

    function main_chat_user_new ( id, status, name ) {
      //Append in the chat!
      $( "#main-sort-chat" ).append( "<div id='user-" + id + "' class='user user-pad scroll-content-item'><li class='" + status + "'><a href='#' style='text-decoration:none;'>" + name + "</a></li></div>" );

      //Remove label of no users connected
      if ( chat_num_users == 0 )
        if ( $( "#chat-main-title-label" ).length == 1 )
          $( "#chat-main-title-label" ).remove();

      //Set status in dialog
      $( "#Dialog" + id ).data( "status", status );

      //Open the chat for styling things
      if ( $( "#main-users-resizer" ).is( ":hidden" ) ) {
        $( "#main-users-resizer" ).show();
        var wasclose = 1;
      }

      //Increase total number of current users
      main_chat_users_num( 0, 0 );

      //Increase total chat main heigh for the new user
      main_chat_set_position( 1 );

      //Close because was closed
      if ( wasclose == 1 )
        $( "#main-users-resizer" ).hide();
    }

    function main_append_dialog ( id, user ) {
      if ( $( "#Dialog" + id ).length == 0 ) {
        $( "body" ).append( "\
          <div id='Dialog" + id + "' title='' user='" + user + "'>\
                                                                              <!-- MUST CHANGE -->\
            <div class='box box-info direct-chat direct-chat-info ui-widget-content no-content-border'>\
              <div class='box-header with-border'>\
                <h4 class='box-title'><small>" + user + "</small></h4>\
                <div class='box-tools pull-right'>\
                  <span data-toggle='tooltip' title='0 New Messages' class='badge bg-blue new-messages'>0</span>\
                  <button class='btn btn-box-tool' data-toggle='tooltip' title='Contacts' data-widget='chat-pane-toggle'><i class='fa fa-comments'></i></button>\
                </div>\
              </div>\
              <div id='warning' class='highlight-padding ui-state-highlight ui-corner-all no-display'>\
                <span class='window ui-icon ui-icon-info'></span>\
                <strong id='warning-alert'></strong><span id='warning-text'></span>\
              </div>\
              <div class='box-body'>\
                <div class='direct-chat-messages'>\
                </div>\
              </div>\
              <div id='iswriting' class='pull-right'>\
                <i class='fa fa-pencil'></i>\
                <small id='iswriting-text'></small>\
              </div>\
              <div id='progressbar-char' class='pull-left'></div>\
              <div class='small-box-footer'>\
                <textarea id='textarea_msg' class='form-control textarea-msg' name='message' placeholder='"+ i18n.type_message +"'></textarea>\
              </div>\
            </div>\
          </div>");
      }
    }

    function main_do_dialog( element, id ) {
      $( element ).tipsy( "hide" );

      if ( $( id ).dialog( "isOpen" ) == false )
        $( id ).dialog( "open" );
      else
        $( id ).dialog( "close" );

      return false;
    }

    //Get all setting in i18n_xx.js
    function main_set_i18n () {
      try {
        if( !i18n ) {
          alert( "Error, i18n not exist" );
          return true;
        }

        var i18n_elem = ['chat', 'tools', 'expand', 'collapse', 'options', 'loading', 'connected', 'disconnected',
        'login', 'name', 'email', 'me', 'and', 'users', 'custom_message', 'busy', 'offline', 'minimize', 'close',
        'cancel', 'info', 'choose_stat', 'close_session', 'open_session', 'char_max', 'is_writing', 'alert', 'user_is', 'theme', 'lang',
        'search', 'rm_search', 'main', 'sounds', 'enabled', 'disabled', 'please_wait', 'no_users', 'user_not_found',
        'seconds', 'reconnection', 'try_it', 'length_of', 'must_be_between', 'failed', 'all_fields_required',
        'validate_username', 'new_messages', 'type_message' ];

        for (var i = 0; i < i18n_elem.length; i++) {
          if (i18n[i18n_elem[i]] === undefined || i18n[i18n_elem[i]] === null) {
            alert( "Error, element i18n_" + i18n_elem[i] + " is undefined or null" );
            return true;
          }
        }

      } catch( error ) {
        alert( error );
        return true;
      }

      $( "#tools, #tools-panel" ).attr( "title", i18n.tools );
      $( "#options, #options-panel" ).attr( "title", i18n.options );
      $( "#rerun-select" ).attr( "title", i18n.choose_stat );
      $( "#chat-search-text" ).attr( "placeholder", i18n.search );
      $( "#textarea_msg" ).attr( "placeholder", i18n.type_message );
      $( "#chat-icon-search" ).attr( "title", i18n.search );
      $( "#chat-icon-close" ).attr( "title", i18n.rm_search );
      $( "#min-main-chat" ).attr( "title", i18n.minimize );
      if ( $( "#text-status" ).val() == text_status )//Prevent overwrite the status
        $( "#text-status" ).val( i18n.custom_message );
      
      text_status = i18n.custom_message;
      text_custom_msg = "";
      $( "#lang" ).text( i18n.lang );
      $( "#option-main" ).text( i18n.main );
      $( "#users-header" ).text( i18n.users );
      $( "#sounds-label" ).text( i18n.sounds + ":" );
      $( "#themes-label" ).text( i18n.theme + ":" );
      $( "#radioenabled" ).next().text( i18n.enabled );
      $( "#radiodisabled" ).next().text( i18n.disabled );
      main_chat_title( chat_title_status );
      $( "#tools-panel" ).dialog( { closeText: i18n.close, autoOpen: false } );
      $( "#options-panel" ).dialog( { closeText: i18n.close, autoOpen: false } );
      //Main chat user status
      $( "#user-status-online" ).find( "a" ).first().text( i18n.online );
      $( "#user-status-busy" ).find( "a" ).first().text( i18n.busy );
      $( "#user-status-offline" ).find( "a" ).first().text( i18n.offline );
      $( "#user-status-logout" ).find( "a" ).first().text( i18n.close_session );
      $( "#dialog-login" ).attr( "title", i18n.login );
      $( "#dialog-login" ).find( "p" ).first().text( i18n.all_fields_required );
      $( "#dialog-login" ).find( "label#label_name" ).text( i18n.name );
      $( "#dialog-login" ).find( "label#label_email" ).text( i18n.email );

      //if ( $( "#no-users-text" ).length > 0 ) $( "#no-users-text" ).text( i18n.no_users );
      //if ( $( "#progressbar-child" ).length > 0 ) $( "#loading-text" ).text( i18n.loading + " " + i18n.please_wait );
    }

    //Set the num of available users
    function main_chat_users_num ( action, set ) {
      //action = 0, increment
      //action = 1, decrement
      //action = 2, set
      var number;

      if ( action == 0 )
        number = chat_num_users + 1;
      else if ( action == 1 )
        number = chat_num_users - 1;
      else if ( action == 2 )
        number = set;
      else
        alert( "main_chat_users_header_num() unexpected value '" + action + "', please report this" );

      chat_num_users = number;
      $( "#users-header-num" ).text( number );
    }

    function main_chat_title( action ) {
      //action == 0, connected
      //action == 1, disconnected
      //action == 2, loading
      var text;
      var label;

      //Reset in changed chat
      if ( chat_changed_lang == true )
        $( "#chat-main-title-ui" ).remove();

      if ( action == 0  ) {
        text  = i18n.connected;
        label = i18n.no_users;
        $( "#progressbar" ).remove();
      }
      else if ( action == 1 ) {
        text  = i18n.disconnected;
        label = i18n.disconnected;
        $( "#progressbar" ).remove();
        $( "#main-sort-chat" ).empty();
      }
      else if ( action == 2 ) {
        text  = i18n.loading;
        label = i18n.loading + " " + i18n.please_wait;
        $( "#main-sort-chat" ).empty();
      }
      else
        alert( "Error, invalid action '" + action + "'" );

      //Label of users
      if ( $( "#main-sort-chat" ).children().length == 0 )
        $( "#main-sort-chat" ).append( "<div id='chat-main-title-label'></div>" );

      $( "#chat-main-title-label" ).text( label );

      //Fancy progress bar
      if (action == 2) {

        if ( $('#chat-title').find('#chat-main-title-ui').length == 1 )
          $( "#chat-main-title-ui" ).remove();

        if ( $('#chat-title').find('#progressbar').length == 0 ) {
          $( "#chat-title" ).append( "<div id='progressbar'><div id='progressbar-child' class='progress-label'>" + text + "</div></div>" );
          $( "#progressbar" ).progressbar({ value: false });//Loading
        } else
          $( "#progressbar-child" ).text( text );

      } else {
        if ( $('#chat-title').find('#chat-main-title-ui').length == 0 )
          $( "#chat-title" ).append( "<div id='chat-main-title-ui' class='ui-widget'><div id='chat-main-title-id' class='chat-main-title'>" + text + "</div></div>" );
      }

      $( "#chat-main-title-id" ).text( text );
      
      chat_title_status = action;
      main_chat_set_position( 0 );
    }

    //Get all setting in config.js
    function main_set_conf () {
      try {
        if( !conf ) {
          alert( "error, conf not exist" );
          return true;
        }

        conf_domain = conf["domain"];
        conf_server_type = conf["server_type"];
        conf_server = conf["server"];
        conf_port = conf["port"];
        conf_auto_login = conf["auto_login"];
        conf_debug = conf["debug"];
        conf_sound_active = conf["sound_active"];
        conf_login_popup = conf["login_popup"];
        conf_tools_disabled = conf["tools_disabled"];
        conf_search_case_sensitive = conf["search_case_sensitive"];
        conf_tools_icon = conf["tools"]["icon"];
        conf_options_disabled = conf["options_disabled"];
        conf_options_icon = conf["options"]["icon"];
        conf_bar_default_expand = conf["bar"]["default_expand"];
        conf_bar_icon_expand = conf["bar"]["icon_expand"];
        conf_bar_icon_collapse = conf["bar"]["icon_collapse"];
        conf_theme_default = conf["theme_default"];
        conf_lang_default = conf["lang_default"];
        conf_themes = new Array();
        conf_lang_text = new Array();
        conf_lang_i18n = new Array();
        conf_shortcuts_text = new Array();
        conf_shortcuts_href = new Array();
        conf_shortcuts_icon = new Array();
        conf_shortcuts_target = new Array();

        //Set shortcuts array
        for ( var i = 0; i < conf["shortcuts"].length; i++ )
        {
          conf_shortcuts_text[i] = conf["shortcuts"][i]["text"];
          conf_shortcuts_href[i] = conf["shortcuts"][i]["href"];
          conf_shortcuts_icon[i] = conf["shortcuts"][i]["icon"];
          conf_shortcuts_target[i] = conf["shortcuts"][i]["target"];
        }

        //Set themes array
        for ( var i = 0; i < conf["themes"].length; i++ )
          conf_themes[i] = conf["themes"][i]["name"];

        //Set lang array
        for ( var i = 0; i < conf["lang"].length; i++ )
        {
          conf_lang_text[i] = conf["lang"][i]["text"];
          conf_lang_i18n[i] = conf["lang"][i]["i18n"];
        }

      } catch( error ) {
        alert( error );
        return true;
      }
    }

    //Change theme function
    function main_set_theme( theme ) {
      var theme_css = "themes/" + theme + "/jquery-ui.min.css";    
      $( "#theme" ).attr( "href" , theme_css );
      return false;
    }

    //Change position on resize window
    function set_position() {
      //Main chat
      $( "#main-users-resizer" ).position({ my: "right bottom", at: "right top", of: "#main", collision: "flip, none" });

      //Tools dialog
      if ( $( "#tools-panel" ).dialog( "isOpen" ) == true )
        $( "#tools-panel" ).dialog( "widget" ).position({ my: "left bottom", at: "left top", of: "#main", collision: "flip, none" });

      //Options dialog
      if ( $( "#options-panel" ).dialog( "isOpen" ) == true )
        $( "#options-panel" ).dialog( "widget" ).position({ my: "right bottom", at: "right top", collision: "flip, none", of: "#main"  });

      //TODO: change position of all chat dialog opened
    }

    function main_chat_new_messages (action, main) {
      // action: 0 set to 0 count of messsages no reed
      // action: 1 increment count of messsages no reed
      if (action == 0) {
        var nmsgs = 0;
      } else {
        var msgs = parseInt(main.find( ".new-messages" ).text());
        var nmsgs = msgs + 1;
      }

      var txt = nmsgs + " " + i18n.new_messages;
      main.find( ".new-messages" ).text( nmsgs );
      main.find( ".new-messages" ).prop("title", txt);
    }

    function main_chat_user_alert ( id, action ) {
      //action = 0, add notification if not already have one
      //action = 1, del notification if already have one
      var main = $( "#Dialog" + id );

      if (action == 0) {
        if ( !main.parent().find( ".ui-dialog-titlebar" ).hasClass( "ui-state-highlight" ) ) {
          main.parent().find( ".ui-dialog-titlebar" ).addClass( "ui-state-highlight", 500 );
          $( "#user-button-" + id ).addClass( "ui-state-error", 500 );  
        }

        //Increment number of new messages not read
        main_chat_new_messages(1, main);

      } else if (action == 1) {
        if ( main.parent().find( ".ui-dialog-titlebar" ).hasClass( "ui-state-highlight" ) ) {
          main.parent().find( ".ui-dialog-titlebar" ).removeClass( "ui-state-highlight", 500 );
          $( "#user-button-" + id ).removeClass( "ui-state-error", 500 );  
        }

        //Set to 0 number of new messages not read
        main_chat_new_messages(0, main);

      } else
        alert( "main_chat_user_alert() unexpected action '" + action + "', please report this" );
    }

    //Disconnect and close
    function main_chat_shutdown() {
      /*chat_stat = 0;
      user_name = '';
      user_email = '';
      user_avatar = '';
      */
      main_chat_disconnect();
    }

    //Disconnect
    function main_chat_disconnect() {
      chat_num_users = 0;
      main_chat_users_num( 2, 0 );//0 chat users at begining
      main_chat_title( 1 );
      main_chat_status( i18n.disconnected, "offline" );
      
      //Close all dialogs
      $( ".ui-dialog-content" ).dialog( "close" );

      //Disabled effect
      //$( "#users" ).accordion( "disable" );
      
      //Disconnect session
      if (socket)
        socket_disconnect();
    }

    function socket_connect() {
      socket = io.connect( 'http://'+ conf_server , {
        port: conf_port,
        'connect timeout': 5000
      });
    }

    function socket_handle() {

      socket.on('connect_failed', function ( data ) {
        main_chat_disconnect();
      });

      socket.on('reconnect_failed', function ( data ) {
        main_chat_disconnect();
      });

      socket.on('error', function ( data ) {
        main_chat_disconnect();
      });

      socket.on('custom_error', function ( data ) {
        alert(data.message);
        main_chat_shutdown();
      });

      socket.on('disconnect', function ( data ) {
        main_chat_disconnect();
      });

      socket.on('connect_timeout', function ( data ) {
        main_chat_disconnect();
      });

      socket.on('reconnecting', function ( data ) {
        //TODO: do something
        // Main chat title, add the loading bar and text
        //main_chat_title( 2 );
      });

      socket.on('connecting', function ( data ) {
        // Main chat title, add the loading bar and text
        main_chat_title( 2 );
      });

      socket.on('connect', function ( data ) {
        console.log('connect');
      });

      socket.on('chat', function (recv) {
        var message = JSON.parse(recv);
        handle_incoming(message)
      });

      chat_join();
    }

    function chat_join() {
      socket.emit('join', { 'user': user_email, 'name': user_name }, function (data) {
        var recv = JSON.parse(data);

        if (recv.login == 'successful') {
          user_name = recv.my_settings.name;
          user_avatar = recv.my_settings.avatar;

          setTimeout(function () {
            main_chat_title( 0 );
            main_chat_status( i18n.connected, 'online' );
          }, 700);
        }
      });
    }

    function socket_disconnect () {
      socket.disconnect();
      chat_reconnect = 1;
    }

    function socket_reconnect() {
      socket.socket.reconnect();
      chat_join();
      chat_reconnect = 0;
    }

    /***************** incoming events **************************/
    function handle_incoming(recv) {
      var action  = recv.action;

      if (action == 'message') {
        var date   = recv.date;
        var iduser = recv.data.user.uid;
        var name   = recv.data.user.name;
        var status = recv.data.user.status;
        var avatar = recv.data.user.avatar;
        var msg    = recv.data.msg;
        var main   = $( "#Dialog" + iduser );

        //Do nothing if user is offline
        // TODO:
        /*if ( status == 'offline' )
          return false;*/
        //Append div user in the bar if is not appended
        if ( $( "#users-button-bar" ).parent().find( "#user-button-" + iduser ).length == 0 ) {
          $( "#users-button-bar" ).append( "<button id='user-button-" + iduser + "' class='user-button' style='font-size: 65%;'><li class='" + status + "'>" + name + "</li></button>" );
          $( ".user-button" ).button();
        }

        //Check focus state and focus document to do sound and alert
        if( !$(document).is(document.activeElement) || !main.find( "#textarea_msg" ).is(document.activeElement) ) {
          //Do sound effect
          //if sounds has been disabled, dont do it
          if ( conf_sound_active == true )
            $( "#audio-popup" ).trigger( "play" );

          //Add notification if not exist
          main_chat_user_alert( iduser, 0 );
        }

        append_msg_he( msg, main, name, date, avatar );
        // FIXME
        // Set dialog position
        main.dialog( "option", "position", { my: "right bottom", at: "right top-3", of: "#user-button-"+iduser, collision: "flip, none" });
      }

      else if ( action == 'newuser' ) {
        //Append the Dialogid
        main_append_dialog( recv.user.uid, recv.user.user );
        main_set_dialog( recv.user.uid, recv.user.user);

        //Append the user to chat
        main_chat_user_new( recv.user.uid, recv.user.status, recv.user.name );
      }

      else if ( action == 'disconnect' ) {
        //Delete the user to chat
        //main_chat_user_delete( recv.user.uid );
        main_chat_user_offline_new( recv.user.uid );
      }

      else if ( action == 'offline' ) {
        //Set offline the user in chat
        main_chat_user_offline( recv.user.uid );
      }

      else if ( action == 'user_typing' ) {
        var userid = recv.data.uid;
        var main = $( "#Dialog" + userid );

        if ( main.parent().find( "#iswriting" ).first().hasClass( "no-display") ) {
          
          main.parent().find( "#iswriting" ).first().removeClass( "no-display" );

          setTimeout(function () {
            main.parent().find( "#iswriting" ).first().addClass( "no-display" );
          }, 2000);
        }
      }

      else if ( action == 'user_status' ) {
        //TODO: if user goes to offline, set the 'popup disable'
        //TODO: if user comes from offline and is set 'popup disable', enable it
        /*if (recv.user.status == 'offline')
          main_chat_user_offline( recv.user.uid );
        else
        */
        main_chat_user_status( recv.user.uid, recv.user.status );
      }

      // Update my setting from backend
      else if ( action == 'update_settings' ) {
        user_name = recv.data.name;
        user_avatar = recv.data.avatar;
      }

      else if ( action == 'usrlist' ) {
        for (i in recv.user) {

          //Append the Dialogid
          main_append_dialog( recv.user[i].uid, recv.user[i].user );
          main_set_dialog( recv.user[i].uid, recv.user[i].user );

          //Append the user to chat
          main_chat_user_new( recv.user[i].uid, recv.user[i].status, recv.user[i].name );
        }
      }

      else {
        console.log('ERROR');
      }
    }

    //Change theme
    $( "#theme-custom" ).change(function() {
      main_set_theme( $( this ).val() );
    });

    //Change sound
    $( "#radioenabled, #radiodisabled" ).change(function() {
      var id = $( this ).attr( "id" );
      
      if (id == 'radioenabled')
        conf_sound_active = true;
      else if (id == 'radiodisabled')
        conf_sound_active = false;
    });

    //Change language
    $( "#i18n" ).change(function() {
      var i18n_js = "i18n_" + $( this ).val() + ".js"
      $.getScript( i18n_js , function(data, textStatus, code) {
        main_set_i18n();
        $( "#format" ).buttonset( "destroy" ).buttonset();//Set the button style for sounds
        //Close all
        $( ".ui-dialog-content" ).dialog( "close" );
        $( "#main-users-resizer" ).hide();
        chat_changed_lang = true;//Change flag for dialog lang
      });
    });

    $( "#slider" ).hide();
    var scrollPane = $(".slider_container");
    var scrollContent = $(".main-chat-window");

    $( "#users-window-chat, #slider" ).mouseover(
      function () {
        //$( this ).append( $( "<span> ***</span>" ) );
        var newheight = $( "#users-window-chat" ).height();
        var height_main_users_resizer = $( "#main-users-resizer" ).height() + 2;
        var height_main_sort_chat = $( "#main-sort-chat" ).height();
        var height_users_window_chat = $( "#users-window-chat" ).height();

        if ( height_main_users_resizer < 600 && height_main_sort_chat > height_users_window_chat ) {
          $( "#slider" ).css( "height", newheight );
          $( "#slider" ).show();
        }
    });

    $( "#users-window-chat, #slider" ).mouseout(
      function () {
        $( "#slider" ).hide();
    });

    //build slider
    var scrollbar = $( "#slider" ).slider({
      orientation: "vertical",
      value: 0,
      slide: function (event, ui) {
        if (scrollContent.height() > scrollPane.height()) {
          scrollContent.css("margin-top", (-1 * (scrollPane.height() - ((scrollPane.height() * ui.value) / 100))) + "px");

        } else {
          scrollContent.css("margin-top", 0);
        }
      }
    });

  }).fail(function() {
    console.log('fail');
  }).always(function() {
    function displayChatOnload() {
      document.getElementById('main').style.display = 'block';
      document.getElementById('options-panel').style.display = 'block';
      //PEND: add parent div, otherwise the main chat not shown by its own
      //document.getElementById('main-users-resizer').style.display = 'block';
    }

    displayChatOnload()
  });

}( jQuery ));
