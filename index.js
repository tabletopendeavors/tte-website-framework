const cross_fade_delay = 300;
const modal_fade_delay = 500;
const core_pages = [
    "about",
    "articles",
    "equipment",
    "gallery",
    "errata",
];
const home_page = core_pages[0];
const article_page_display = {
    list: 0,
    article: 1
};

async function fetch_html_as_text( url ) {
    return await (await fetch( url )).text();
}

function copy_url_to_clipboard() {
    navigator.clipboard.writeText( window.location );
}

function scroll_to_origin() {
    window.scrollTo( 0, 0 );
}

async function set_fade_on_div( element_id, fade ) {
    var element_to_fade = document.getElementById( element_id );
    if( element_to_fade.classList.contains('fade') == fade ) {
        return;
    }
    if( fade ) {
        element_to_fade.classList.add('fade');
    } else {
        element_to_fade.classList.remove('fade');
    }
    await new Promise( resolve => setTimeout( resolve, cross_fade_delay ) );
}

async function set_div_content_from_file( div_id, file_path ) {
    var div = document.getElementById( div_id );
    div.innerHTML = await fetch_html_as_text( file_path );
}

function page_exists( name ) {
    return core_pages.includes( name );
}

async function go_home() {
    if( (new URLSearchParams(window.location.search)).get('page') == home_page ) {
        return;
    }
    await set_fade_on_div("content", true);
    await set_div_content_from_file( "content", home_page + ".html" );
    window.history.replaceState(null, null, "?page=" + home_page );
    await set_fade_on_div("content", false);
}

function register_pin_observer( target_div, root_div ) {
    const observer = new IntersectionObserver( (entries) => {
        entries.forEach( entry => {
            if( entry.isIntersecting ) {
                target_div.classList.remove( "pinned" );
            } else {
                target_div.classList.add( "pinned" );
            }
        });
    });
    observer.observe( root_div );
}

function register_observers() {
    const pin_sensor_top       = document.getElementById( "pin-sensor-top" );
    const pin_sensor_bottom    = document.getElementById( "pin-sensor-bottom" );
    const article_controls_div = document.getElementById( "article-controls" );
    const back_to_top_div      = document.getElementById( "back-to-top" );
    register_pin_observer( article_controls_div, pin_sensor_top );
    register_pin_observer( back_to_top_div, pin_sensor_bottom );
}

async function set_article_page_display( state ) {
    var article_controls_div = document.getElementById( "article-controls" );
    var article_content_div  = document.getElementById( "article-content" );
    var back_to_top_div      = document.getElementById( "back-to-top" );
    var article_list_div     = document.getElementById( "article-list" );
    article_controls_div.style.display = ( state == article_page_display.list ) ? "none"   : "flex";
    article_content_div.style.display  = ( state == article_page_display.list ) ? "none"   : "flex";
    back_to_top_div.style.display      = ( state == article_page_display.list ) ? "none"   : "block";
    article_list_div.style.display     = ( state == article_page_display.list ) ? "inline" : "none";
}

async function load_article( target_article ) {
    set_article_page_display( article_page_display.article );
    register_article_observers();
    await set_div_content_from_file( "article-content", "content/articles/" + target_article + ".html" );
    const title_element = document.getElementById( "article-title-header" );
    const hidden_title_element = document.getElementById( "article-title" );
    title_element.innerHTML = hidden_title_element.innerHTML;
}

const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback(...args);
        }, wait);
    };
}

async function load_site() {
    const url_params = new URLSearchParams( window.location.search );
    const page_param = url_params.get( "page" );
    if( page_param && page_exists( page_param ) ) {
        await set_div_content_from_file( "content", page_param + ".html"  );
        const article_param = url_params.get( "article" );
        if( article_param ) {
            load_article( article_param );
        }
    } else {
        await set_div_content_from_file( "content", home_page + ".html"  );
    }
    addEventListener( "scroll", (event) => {
        const scroll_y = window.scrollY;
        var btt_element = document.getElementById( "back-to-top" );
        if( scroll_y > 960 ) {
            btt_element.classList.add( "available" );
        } else {
            btt_element.classList.remove( "available" );
        }
    });
    register_observers();
    set_fade_on_div( "content", false );
}

async function navigate_to_page( target_page ) {
    const url_params = new URLSearchParams( window.location.search );
    const page_param = url_params.get( "page" );
    if( page_param ) {
        if( page_param == "articles" && target_page == "articles" ) {
            const article_param = url_params.get( "article" );
            if( !article_param ) {
                return;
            }
        } else if( page_param == target_page ) {
            return;
        }
    }
    await set_fade_on_div( "content", true );
    await set_div_content_from_file( "content", target_page + ".html" );
    window.history.replaceState(null, null, "?page=" + target_page );
    await set_fade_on_div( "content", false );
}

async function navigate_to_article( target_article ) {
    await set_fade_on_div( "content", true );
    load_article( target_article );
    window.history.replaceState( null, null, "?page=articles&article=" + target_article );
    await set_fade_on_div( "content", false );
}

async function close_article() {
    await set_fade_on_div( "content", true );
    set_article_page_display( article_page_display.list );
    window.history.replaceState( null, null, "?page=articles" );
    await set_fade_on_div( "content", false );
}

async function show_image( element ) {
    var model_image_div = document.getElementById( "modal-image" );
    model_image_div.src = element.children[0].src;
    var modal_div = document.getElementById( "modal" );
    modal_div.style.display="block";
    modal_div.classList.toggle( 'visible' );
}

async function close_modal() {
    var modal_div = document.getElementById( "modal" );
    modal_div.classList.remove( 'visible' );
    setTimeout(async () => {
        modal_div.style.display="none";
    }, modal_fade_delay );
}
