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
