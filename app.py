import streamlit as st
import streamlit.components.v1 as components

html = open("vibra/index.html").read()

components.html(html)