// Point d'entrée de la bibliothèque Tauri : plugin SQLite + commande d'impression.

// Écrit le HTML du relevé dans un fichier temporaire et l'ouvre avec le navigateur
// par défaut, où l'impression / l'export PDF fonctionne (WKWebView macOS ne gère
// pas window.print()). Le HTML inclut un script d'auto-impression.
#[tauri::command]
fn open_statement(html: String) -> Result<(), String> {
    let mut path = std::env::temp_dir();
    path.push("mowobank_releve.html");
    std::fs::write(&path, html).map_err(|e| e.to_string())?;
    opener::open(&path).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![open_statement])
        .run(tauri::generate_context!())
        .expect("erreur au démarrage de l'application MoWoBank");
}
