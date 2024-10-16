import streamlit as st
import streamlit.components.v1 as components
from utils.streamlit_style import hide_streamlit_style

GITHUB_URL = "https://github.com/BayernMuller/vibra"

st.set_page_config(
    page_title="vibra-live-demo",
    page_icon="🎧",
    layout="centered",
    initial_sidebar_state="collapsed"
)

hide_streamlit_style()

body = f"""
<a href="{GITHUB_URL}" style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
    <img src="{GITHUB_URL}/raw/main/docs/project_vibra.png" width=60%>
    <br>
    <img src="{GITHUB_URL}/raw/main/docs/logo_license.svg" width=60%>
</a>

<div style="text-align: center;">
    <h1>vibra</h1>
    <p>Web Assembly Music Recognition Service Live Demo!</p>
</div>

<script>
    window.addEventListener('message', function(event) {{
        if (event.data.redirectUrl) {{  
            window.location.href = event.data.redirectUrl;
        }}
    }});
</script>
"""
st.markdown(body, unsafe_allow_html=True)

vibra_html = open("public/index.html").read()
components.html(vibra_html)

