package booktitletransport

import (
	"book-store-management-backend/common"
	"book-store-management-backend/component/appctx"
	"book-store-management-backend/component/generator"
	"book-store-management-backend/module/author/authorrepo"
	"book-store-management-backend/module/author/authorstore"
	"book-store-management-backend/module/booktitle/booktitlebiz"
	"book-store-management-backend/module/booktitle/booktitlemodel"
	booktitlerepo "book-store-management-backend/module/booktitle/booktitlerepo"
	booktitlestore "book-store-management-backend/module/booktitle/booktitlestore"
	"book-store-management-backend/module/category/categoryrepo"
	"book-store-management-backend/module/category/categorystore"
	"github.com/gin-gonic/gin"
	"net/http"
)

// CreateBookTitle
// @BasePath /v1
// @Summary Create booktitle name, desc, authors, categories.
// @Tags booktitles
// @Accept json
// @Produce json
// @Param booktitle body booktitlemodel.ReqCreateBookTitle true "Create booktitle"
// @Response 200 {object} booktitlemodel.ResCreateBookTitle "booktitle id"
// @Router /booktitles [post]
func CreateBookTitle(appCtx appctx.AppContext) gin.HandlerFunc {
	return func(c *gin.Context) {
		var reqData booktitlemodel.ReqCreateBookTitle
		if err := c.ShouldBind(&reqData); err != nil {
			panic(common.ErrInvalidRequest(err))
		}

		db := appCtx.GetMainDBConnection().Begin()

		store := booktitlestore.NewSQLStore(db)
		authorStore := authorstore.NewSQLStore(db)
		categoryStore := categorystore.NewSQLStore(db)

		repo := booktitlerepo.NewCreateBookRepo(store)
		authorRepo := authorrepo.NewExistAuthorRepo(authorStore)
		categoryRepo := categoryrepo.NewExistCategoryRepo(categoryStore)

		gen := generator.NewShortIdGenerator()

		biz := booktitlebiz.NewCreateBookTitleBiz(gen, repo, authorRepo, categoryRepo)

		var resData booktitlemodel.ResCreateBookTitle

		if err := biz.CreateBookTitle(c.Request.Context(), &reqData, &resData); err != nil {
			db.Rollback()
			panic(err)
		}

		if err := db.Commit().Error; err != nil {
			db.Rollback()
			panic(err)
		}

		c.JSON(http.StatusOK, common.SimpleSuccessResponse(resData))
	}
}
