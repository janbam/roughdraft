import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const STORAGE_KEY = "roughdraft:content";

const defaultContent = `<h1>Welcome to Roughdraft</h1>
<p>Start writing. Your work is saved automatically.</p>`;

function loadContent(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || defaultContent;
  } catch {
    return defaultContent;
  }
}

export function App() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: loadContent(),
    onUpdate: ({ editor }) => {
      try {
        localStorage.setItem(STORAGE_KEY, editor.getHTML());
      } catch {
        // storage full or unavailable
      }
    },
  });

  return (
    <div className="container">
      <EditorContent editor={editor} />
    </div>
  );
}
