// @ts-nocheck
import { Button } from '@mantine/core';
import './ContentPreview.css'

function ContentPreview({iframeSrc}: any) {
    // inject the iframeSrc into the iframe
  return (
    <>
        <h2 className="content-title">Email Preview</h2>
        <iframe 
          srcDoc={iframeSrc} 
          title="Generated Email Preview" 
          className="preview-iframe"
        />
        <Button style={{marginBottom: 0}} onClick={(() => {
            chrome.runtime.sendMessage({ type: "update_draft", body: iframeSrc })
        })} type="submit" radius="xl" color="mfgreen.8" variant="filled" fullWidth>Use this email!</Button>
    </>
  )
}

export default ContentPreview;