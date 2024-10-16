import streamlit as st

def hide_streamlit_style():
    global_css = """
    <style>
    body, .stTextInput>div>div>input, .stMarkdown>div>p, .stTextArea>div>div>textarea {
        word-break: keep-all; 
    }

    a, a:link, a:visited, a:hover, a:active {
        color: black !important;
    }
    </style>
    """
    st.markdown(global_css, unsafe_allow_html=True)

    hide_streamlit_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            </style>
            """
    st.markdown(hide_streamlit_style, unsafe_allow_html=True)

    hide_decoration_bar_style = """
    <style>
        header {visibility: hidden;}
    </style>
    """
    st.markdown(hide_decoration_bar_style, unsafe_allow_html=True)

def allow_top_navigation():
    ''' Allow links embedded in iframes to open in the same tab (target='_parent' or '_top')
    Useful for links in AgGrid grids
    '''
    # I know... This is ugly... 
    # Waiting for next versions of Streamlit when there will be more control over iframes
    # or maybe with better tables in order to get rid of AG Grid altogether

    # Refer to http://www.backalleycoder.com/2012/04/25/i-want-a-damnodeinserted/
    st.components.v1.html('''<script language="javascript">
        // The document will listen to all 'animationstart' events and some of which have been named 'nodeInserted' by a css trick
       
        var updateAndReloadIframes = function () {
            var reloadRequired = false;
            // Grab all iFrames from agGrid, add the 'allow-top-navigation' property and reload them
            var iframes = parent.document.querySelectorAll("iframe[title='st_aggrid.agGrid']");
            for (var i = 0; i < iframes.length; i++) {
                if (!iframe.sandbox.contains('allow-top-navigation')) {
                    reloadRequired = true;
                    iframes[i].setAttribute("sandbox", "allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads allow-top-navigation-by-user-activation allow-top-navigation");
                }
            }
            if (reloadRequired) {
                setTimeout(function() {
                    for (var i = 0; i < iframes.length; i++) {
                        iframes[i].contentWindow.location.reload();
                    }
                }, 300)
            }
        }

        var event = function(event){
            if (event.animationName == 'nodeInserted') updateAndReloadIframes()
        }
        parent.document.addEventListener('animationstart', event, false);
        parent.document.addEventListener('MSAnimationStart', event, false);
        parent.document.addEventListener('webkitAnimationStart', event, false);

        // Some weird bug appear in prod env. Fix: ping the DOM every 1 second to add the property to the iframes if necessary
        var intervalId = window.setInterval(function(){
            var reloadRequired = false;
            parent.document.querySelectorAll("iframe[title='st_aggrid.agGrid']").forEach((iframe) => {
                if (!iframe.sandbox.contains('allow-top-navigation')) reloadRequired = true;
            })
            if (reloadRequired) updateAndReloadIframes()
        }, 1000);

    </script>
    ''', height=0)