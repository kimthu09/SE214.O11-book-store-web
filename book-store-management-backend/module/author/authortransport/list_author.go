package authortransport

import (
	"book-store-management-backend/common"
	"book-store-management-backend/component/appctx"
	"book-store-management-backend/module/author/authorbiz"
	"book-store-management-backend/module/author/authormodel"
	"book-store-management-backend/module/author/authorrepo"
	"book-store-management-backend/module/author/authorstore"
	"github.com/gin-gonic/gin"
	"net/http"
)

// @BasePath /v1
// @Summary Get all authors
// @Tags authors
// @Accept json
// @Produce json
// @Response 200 {object} authormodel.ResListAuthor
// @Router /authors [get]
// @Param page query int false "Page"
// @Param limit query int false "Limit"
func ListAuthor(appCtx appctx.AppContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		var filter authormodel.Filter
		if err := c.ShouldBind(&filter); err != nil {
			panic(common.ErrInvalidRequest(err))
		}

		var paging common.Paging
		if err := c.ShouldBind(&paging); err != nil {
			panic(common.ErrInvalidRequest(err))
		}

		paging.Fulfill()

		store := authorstore.NewSQLStore(appCtx.GetMainDBConnection())
		repo := authorrepo.NewListAuthorRepo(store)

		biz := authorbiz.NewListAuthorRepo(repo)

		result, err := biz.ListAuthor(c.Request.Context(), &filter, &paging)

		if err != nil {
			panic(err)
		}

		c.JSON(http.StatusOK, common.NewSuccessResponse(result, paging, filter))
	}
}
