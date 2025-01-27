import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState } from "react";

function useEditorContent() {
  const [editor] = useLexicalComposerContext();
  const [content, setContent] = useState("");

  useEffect(() => {
    const updateContent = () => {
      editor.update(() => {
        const editorState = editor.getEditorState();
        const plainText = editorState.read(() => {
          const root = $getRoot();
          return root.getTextContent();
        });
        setContent(plainText);
      });
    };

    editor.registerUpdateListener(() => {
      updateContent();
    });

    return () => {
      editor.unregisterUpdateListener(updateContent);
    };
  }, [editor]);

  return content;
}

export default useEditorContent;
