package com.agentdone

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.components.PersistentStateComponent
import com.intellij.openapi.components.ServiceManager
import com.intellij.openapi.components.State
import com.intellij.openapi.components.Storage
import java.net.HttpURLConnection
import java.net.URL

@State(name = "AgentDoneSettings", storages = [Storage("agentDoneSound.xml")])
class AgentDoneSettings : PersistentStateComponent<AgentDoneSettings.State> {
    data class State(
        var coreServiceUrl: String = "http://localhost:4545",
        var authToken: String = "local-dev-token"
    )

    private var myState = State()

    override fun getState(): State = myState
    override fun loadState(state: State) { myState = state }
}

class PlaySoundAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val settings = ServiceManager.getService(AgentDoneSettings::class.java).state
        notifyCoreService(settings.coreServiceUrl, settings.authToken)
    }

    private fun notifyCoreService(serviceUrl: String, token: String) {
        try {
            val url = URL("$serviceUrl/play")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            
            val json = "{\"token\": \"$token\"}"
            connection.outputStream.write(json.toByteArray())
            
            if (connection.responseCode != 200) {
                println("Failed to connect to core service: ${connection.responseCode}")
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
