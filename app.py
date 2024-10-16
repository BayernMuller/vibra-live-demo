import streamlit as st
import streamlit.components.v1 as components

html = open("public/index.html").read()

components.html(html)