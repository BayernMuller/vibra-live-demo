import streamlit as st
from streamlit.components.v1 import html
from utils.streamlit_style import (
    hide_streamlit_style,
    allow_top_navigation,
)
from shazam import Shazam

GITHUB_URL = "https://github.com/BayernMuller/vibra"
st.set_page_config(
    page_title="vibra-live-demo",
    page_icon="🎧",
    layout="centered",
    initial_sidebar_state="collapsed"
)
hide_streamlit_style()
allow_top_navigation()

def show_vibra_header(placeholder):
    with placeholder.container():
        st.markdown(f"""
        <a href="{GITHUB_URL}" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
            <img src="{GITHUB_URL}/raw/main/docs/project_vibra.png" width=60%>
            <br>
            <img src="{GITHUB_URL}/raw/main/docs/logo_license.svg" width=60%>
        </a>
        """, unsafe_allow_html=True)

def show_recognition_info(placeholder, image, title, subtitle):
    with placeholder.container():
        st.markdown(f"""
        <div style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
            <img src="{image}" width=30%" style="margin-right: 20px; border-radius: 20px;">
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <p style="font-size: 2em; font-weight: bold; margin-bottom: 5px;">{title}</p>
                <p style="font-size: 1.2em; color: gray; margin-top: 0;">{subtitle}</p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        st.divider()
        st.write('')

def show_footer():
    st.markdown(f"""
    <div style="display: flex; align-items: center;">
        <img src="https://github.com/bayernmuller.png" width=9%
                    style="border-radius: 100px; border: 1px solid #eaeaea; margin-right: 10px;">
        <div style="display: flex; flex-direction: column;">
            <a href="{GITHUB_URL}">@BayernMuller</a>
            <a href="{GITHUB_URL}">{GITHUB_URL}</a>
        </div>
    </div>
    """, unsafe_allow_html=True)
    st.divider()

def show_title():
    st.markdown(f"""
    <div style="text-align: center;">
        <h1>vibra</h1>
        <p>Web Assembly Music Recognition Service Live Demo!</p>
    </div>
    """, unsafe_allow_html=True)

def load_vibra_html():
    vibra_html = open("public/index.html").read()
    html(vibra_html, height=80)

def get_query_params():
    params = st.query_params
    url = params.get("uri")
    samplems = params.get("samplems")
    return url, samplems

def recognize_song(url, samplems):
    recognizer = Shazam()
    result = recognizer.recognize(url, samplems)
    return result

def display_recognition_result(result, title_holder):
    try:
        album_art = result.get("track").get("images").get("coverart")
        title = result.get("track").get("title")
        subtitle = result.get("track").get("subtitle")
    except Exception as e:
        st.error("Recognition failed.")
        st.write("* Make sure you are recording a song with a clear audio.")
        st.write("* Try to record a song for at least 5 seconds.")
        show_vibra_header(title_holder)
        return
        
    show_recognition_info(title_holder, album_art, title, subtitle)

def main():
    show_footer()
    title_holder = st.container()
    show_title()
    load_vibra_html()
    url, samplems = get_query_params()
    if not url or not samplems:
        st.info("Record Song and Try to Recognize it!")
        st.write("* Mobile browsers could be unstable.")
        show_vibra_header(title_holder)
        st.stop()
    else:
        print(url[:100])
        samplems = int(samplems)
        with st.spinner("Recognizing..."):
            result = recognize_song(url, samplems)
        display_recognition_result(result, title_holder)

if __name__ == "__main__":
    main()