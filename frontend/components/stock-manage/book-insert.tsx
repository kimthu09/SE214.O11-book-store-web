import { useState } from "react";
import { Input } from "../ui/input";

import { Button } from "../ui/button";
import {
  Control,
  UseFormReturn,
  useFieldArray,
  useWatch,
} from "react-hook-form";

import { AiOutlineClose } from "react-icons/ai";
import { CiBoxes } from "react-icons/ci";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { z } from "zod";
import { FormSchema } from "@/app/stockmanage/import/add/page";
import { BookProps } from "@/types";
import { toVND } from "@/lib/utils";
import { toast } from "../ui/use-toast";
import Loading from "../loading";
import { getApiKey } from "@/lib/auth/action";
import { AutoComplete } from "../ui/autocomplete";
import getAllBookList from "@/lib/book/getAllBookList";
import getAllBookForSale from "@/lib/book/getAllBookForSale";
const Total = ({
  control,
}: {
  control: Control<z.infer<typeof FormSchema>>;
}) => {
  const formValues = useWatch({
    name: "details",
    control,
  });
  const total = formValues.reduce(
    (acc, current) => acc + (current.price || 0) * (current.qtyImport || 0),
    0
  );
  return <p>{toVND(total)}</p>;
};

const AddUp = ({
  control,
  index,
}: {
  control: Control<z.infer<typeof FormSchema>>;
  index: number;
}) => {
  const formValues = useWatch({
    name: `details.${index}`,
    control,
  });
  const addUp = formValues.price * formValues.qtyImport;
  return <p>{toVND(addUp)}</p>;
};

const BookInsert = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof FormSchema>, any, undefined>;
}) => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    getValues,
    reset,
    formState: { errors },
  } = form;
  const {
    fields: fieldsBook,
    append: appendBook,
    remove: removeBook,
    replace,
  } = useFieldArray({
    control: control,
    name: "details",
  });
  const { books: data, isLoading, isError, mutate } = getAllBookForSale();
  const [value, setValue] = useState<BookProps>();
  const handleOnValueChange = (item: BookProps) => {
    console.log("hi..........");
    if (!fieldsBook.find((book) => book.bookId === item.id)) {
      console.log("quao.....");
      appendBook({
        bookId: item.id,
        qtyImport: 0,
        price: item.importPrice,
        oldPrice: item.importPrice,
        isReplacePrice: false,
      });
      console.log(fieldsBook);
    }
  };
  if (isError) {
    return "Failed to fetch";
  } else if (isLoading || !data) {
    return <Loading />;
  } else {
    return (
      <div className="flex flex-col">
        <AutoComplete
          options={data.data}
          emptyMessage="Không có sách khớp với từ khóa"
          placeholder="Tìm sách"
          onValueChange={handleOnValueChange}
          value={value}
        />
        <div>
          <div className="grid grid-cols-5 lg:gap-3 gap-2 font-medium py-2 px-2 mt-2 rounded-t-md bg-[#a4c5ff]">
            <h2 className="col-span-2">Tên sách</h2>
            <h2 className=" text-left col-span-1">Đơn giá</h2>
            <h2 className=" text-left col-span-1">Số lượng</h2>
            <h2 className=" text-right col-span-1 pr-12 ">Thành tiền</h2>
          </div>
          <div className="border border-t-0 py-2 rounded-b-md">
            {fieldsBook.length < 1 ? (
              <div className="flex flex-col items-center gap-4 py-8 text-muted-foreground font-medium">
                <CiBoxes className="h-24 w-24 text-muted-foreground/40" />
                {errors.details?.root ? (
                  <span className="error___message">
                    {errors.details.root?.message}
                  </span>
                ) : (
                  "Chọn sản phẩm nhập kho"
                )}
              </div>
            ) : null}
            {fieldsBook.map((book, index) => {
              const value = data.data.find((item) => item.id === book.bookId);
              console.log("sách: " + value);
              if (value) {
                return (
                  <div
                    key={book.id}
                    className="grid grid-cols-5 items-center p-2 lg:gap-3 gap-2"
                  >
                    <div className="flex col-span-2">
                      <h2 className="font-medium">{value?.name}</h2>
                    </div>
                    <div className="relative p-1 col-span-1">
                      <Input
                        type="number"
                        defaultValue={book.price}
                        {...register(`details.${index}.price` as const)}
                        min={1}
                      ></Input>
                      {errors.details && errors.details[index] ? (
                        <span className="error___message">
                          {errors.details[index]?.message}
                        </span>
                      ) : null}
                      <div className="absolute top-0 right-0 cursor-pointer group">
                        <IoMdInformationCircleOutline
                          className={`h-5 w-5 text-teal-700`}
                        />

                        <span
                          className="absolute bottom-5 right-3 w-fit whitespace-nowrap scale-0 transition-all rounded bg-teal-100 p-2 text-xs font-medium text-teal-800 group-hover:scale-100
                      group-active:scale-100"
                        >
                          Giá ban đầu: {toVND(book.oldPrice)}
                        </span>
                      </div>
                    </div>

                    <Input
                      type="number"
                      className="lg:w-full col-span-1"
                      defaultValue={book.qtyImport}
                      {...register(`details.${index}.qtyImport` as const)}
                      min={1}
                    ></Input>

                    <div className="text-right flex justify-end gap-2 items-center col-span-1">
                      <AddUp control={control} index={index} />
                      <Button
                        type="button"
                        variant={"ghost"}
                        className={`px-3`}
                        onClick={() => {
                          removeBook(index);
                        }}
                      >
                        <AiOutlineClose />
                      </Button>
                    </div>
                  </div>
                );
              } else {
                //TODO
              }
            })}
          </div>
        </div>

        <div className="flex justify-end pt-6 pr-14 font-medium ">
          <h2 className="w-1/4">Tổng cộng</h2>
          <div className="flex">
            <span>
              <Total control={control} />
            </span>
          </div>
        </div>
      </div>
    );
  }
};

export default BookInsert;
