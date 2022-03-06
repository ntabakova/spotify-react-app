import { useState, useEffect } from "react";
import qs from "qs";
import { Row, Col } from "antd";
import { Form, Input } from "antd";
import SearchList from "../components/SearchList";
import AppPagination from "../components/AppPagination";

const axios = require("axios");
var Buffer = require("buffer/").Buffer;

let initial = true;

const SearchPage = () => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const onSearch = (value) => {
    setSearchText(value);
    initial = false;
    setCurrentPage(0);
  };

  const pageChangeHandler = (page) => {
    setCurrentPage(page - 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // clientId & clientSecret should normally be not exposed here
      const clientId = "37ca67209d5d459091f55a8fcc0f34cc";
      const clientSecret = "77fceae630c547829395eda42975f6e3";
      let token;

      const headers = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + new Buffer(clientId + ":" + clientSecret).toString("base64"),
        },
      };
      const data = {
        grant_type: "client_credentials",
      };

      try {
        const response = await axios.post(
          "https://accounts.spotify.com/api/token",
          qs.stringify(data),
          headers
        );

        token = response.data.access_token;
      } catch (error) {}

      const response = await axios.get(
        `https://api.spotify.com/v1/search?type=artist&q=${searchText}&limit=10&offset=${currentPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(response.data.artists.items);
      setTotalCount(response.data.artists.total);
      setIsLoading(false);
    };

    if (searchText && searchText.length >= 3) {
      fetchData();
    }
  }, [searchText, currentPage]);

  return (
    <>
      <Row>
        <Col
          xs={{ span: 20, offset: 2 }}
          sm={{ span: 16, offset: 4 }}
          md={{ span: 12, offset: 6 }}
          lg={{ span: 10, offset: 7 }}
          xlg={{ span: 8, offset: 8 }}
        >
          <h1 className="mt-5 mb-3">Search artists:</h1>
          <Form layout="vertical">
            <Input.Search enterButton="Search" size="large" onSearch={onSearch} />
            {searchText.length < 3 && !initial && (
              <p className="mt-2">Please enter at least 3 characters</p>
            )}
          </Form>
        </Col>
      </Row>
      <Row>
        <Col
          xs={{ span: 22, offset: 1 }}
          sm={{ span: 20, offset: 2 }}
          md={{ span: 16, offset: 4 }}
          lg={{ span: 14, offset: 5 }}
          xlg={{ span: 10, offset: 7 }}
        >
          {isLoading && <p>Fetching artists...</p>}
          {!isLoading && !initial && <SearchList results={results} />}

          {!isLoading && totalCount > 10 && (
            <AppPagination
              totalCount={totalCount}
              pageChangeHandler={pageChangeHandler}
              currentPage={currentPage}
            />
          )}
        </Col>
      </Row>
    </>
  );
};

export default SearchPage;
