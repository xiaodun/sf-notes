export const DIRECTORY_MODAL_MEMORY_STORAGE_KEY = "sf_notes_directory_modal_memory";

export const DIRECTORY_MODAL_MEMORY_KEYS = {
  SF_NOTES_PROJECT_ADD: "sf_notes_project_add_directory",
  SF_NOTES_PROJECT_SNIPPET_WRITE_PATH: "sf_notes_project_snippet_write_path",
  SF_NOTES_PROJECT_SNIPPET_WRITE_OS: "sf_notes_project_snippet_write_os_directory",
  SF_NOTES_NOVEL_ADD_PATH: "sf_notes_novel_add_path",
} as const;

export type TDirectoryMemoryKey =
  (typeof DIRECTORY_MODAL_MEMORY_KEYS)[keyof typeof DIRECTORY_MODAL_MEMORY_KEYS];
