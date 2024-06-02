import { Site } from "@/types/Site";
import { useCallback, useEffect, useState } from "react"

// if you are using Mockup Data

// We don't know or have access to the data in this hook, so we are passing `data` as a placeholder argument
// We also don't know the limit yet, we simply pass `limit` as argument

export const useMockPaginate = (data: Site[], limit: number) => {
    const [currentPage, setPage] = useState(1)

    const getPaginatedData = () => {

        // assuming the limit is 20

        // remember counting data in an array starts from 0

        // declare where to start getting the data from
        const startIndex = (currentPage - 1) * limit // if current page is 1, it will be start fetching the data from 0. i.e; (1-1) * 20 = 0

        // declare where to stop the data
        const endIndex = startIndex + limit // if the current page is 1, it will stop fetching the data at 20. i.e (0 + 20)

        // Finally return the data

        return data.slice(startIndex, endIndex)   // 
    }


    // save and invoke the paginatedData function in a variable

    const paginatedData = getPaginatedData()



    // Handle Previous Page


    const prevPage = () => {
        // Note there is no page zero, page starts from 1.

        // If if the current page is 1 and user clicks the previous button, do nothing

        // But if the current page is greater than one, go to the previous page by decrementing 1 from current page

        if (currentPage > 1) {
            setPage(previousPage => previousPage - 1)
        }
    }



    // handle Next page


    const nextPage = () => {

        // If the user is not already at the last page, go to the next page
        // If the user is at the last page, do nothing

        // We check if the current page is less than the paginated pages.

        if (currentPage < Math.ceil(data.length / limit)) {
            setPage(previousPage => previousPage + 1)
        }
    }


    // Finally return all your functions

    return { nextPage, prevPage, paginatedData, currentPage, setPage }

}