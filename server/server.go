package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"workspaces"
)

func main() {
	if err := workspaces.InitBomulus(); err != nil {
		log.Fatal(err)
	}

	app := NewApp()
	router := gin.Default()

	api := router.Group("/api")
	{
		api.POST("/workspaces", app.CreateWorkspaceHandler)
		api.GET("/workspaces/recent", app.GetRecentWorkspacesHandler)
		api.POST("/compare", app.BtnCompareHandler)
		api.POST("/set-active", app.SetActiveWorkspaceHandler)
		api.DELETE("/workspaces", app.DeleteWorkspaceHandler)
		api.POST("/delete-bom", app.DeleteBOMFileHandler)
		api.POST("/add-file", app.AddFileToWorkspaceHandler)
		api.GET("/components", app.GetComponentsHandler)
		api.POST("/files", app.GetFilesInWorkspaceInfoHandler)
		api.POST("/upload-bom", app.UploadBOMHandler)
		api.GET("/api-keys", app.GetSavedAPIKeysHandler)
		api.POST("/production-qty", app.SetProductionQuantityHandler)
		api.POST("/price-calc", app.PriceCalculatorHandler)
		api.GET("/refresh-days", app.GetAnalysisRefreshDaysHandler)
		api.POST("/refresh-days", app.SetAnalysisRefreshDaysHandler)
		api.POST("/designators", app.UpdateDesignatorsHandler)
		api.POST("/designators/update-bmls", app.UpdateBMLSDesignatorsHandler)
		api.GET("/analyze-save-state", app.GetAnalyzeSaveStateHandler)
		api.POST("/analyze-save-state", app.SetAnalyzeSaveStateHandler)
	}

	router.Run(":8080")
}
