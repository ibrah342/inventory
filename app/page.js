"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, Typography, Stack, TextField, AppBar, Toolbar, InputBase, FormControlLabel, Checkbox } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { styled, alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from '@/firebase'; // Ensure this path is correct

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const BlinkingButton = styled(Button)(({ theme }) => ({
  animation: 'blinking 1s infinite',
  '@keyframes blinking': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0 },
    '100%': { opacity: 1 },
  },
}));

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [category, setCategory] = useState({ food: false, liquid: false });

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    const newItemData = {
      quantity: 1,
      category: { food: category.food ?? false, liquid: category.liquid ?? false },
    };

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { ...docSnap.data(), quantity: quantity + 1, category: newItemData.category });
    } else {
      await setDoc(docRef, newItemData);
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = (event) => setItemName(event.target.value);
  const handleCategoryChange = (event) => setCategory({ ...category, [event.target.name]: event.target.checked });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setIsSearching(true);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <AppBar sx={{ backgroundColor: '#2980b9' }}>
        <Toolbar>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Search>
          <Box width="800px"
            height="100px"
            alignItems="center"
            justifyContent="center" display="flex">
            <Typography variant="h2" color="#fdfefe">
              Inventory Tracker
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            onClick={handleOpen}
            style={{ animation: isSearching ? 'blinking 1s infinite' : 'none' }}
          >
            Add New Item
          </Button>

        </Toolbar>
      </AppBar>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={600}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: "translate(-50%, -50%)" }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={handleChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={category.food}
                  onChange={handleCategoryChange}
                  name="food"
                  color="primary"
                />
              }
              label="Food"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={category.liquid}
                  onChange={handleCategoryChange}
                  name="liquid"
                  color="primary"
                />
              }
              label="Liquid"
            />
            <Button
              variant="outlined" onClick={() => {
                addItem(itemName, category)
                setItemName('')
                setCategory({ food: false, liquid: false });
                handleClose()
              }}>Add</Button>
          </Stack>
        </Box>
      </Modal>

      <Box border="2.5px solid #333" width="800px">
        <Stack width="800px" height="300px" spacing={1} overflow="auto">
          {filteredInventory.length === 0 ? (
            <Box width="100%" display="flex" justifyContent="center" alignItems="center">
              <Typography variant="h4" color="black" textAlign="center">
                Inventory Empty
              </Typography>
            </Box>
          ) : (
            filteredInventory.map(({ name, quantity, category = { food: false, liquid: false } }) => (
              <Box
                key={name}
                width='100%'
                height="30px"
                display="flex"
                alignItems="center"
                justifyContent='space-between'
                bgcolor="#2980b9"
                padding={4} >
                <Typography
                  variant="h3"
                  color="white"
                  textAlign="center">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h3" color="white" textAlign="center">
                  {quantity}
                </Typography>
                <Typography variant="h5" color="white" textAlign="center">
                  {category.food ? "Food" : category.liquid ? "Liquid" : ""}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() =>
                    addItem(name, category)
                  }>Add</Button>
                  <Button variant="contained" onClick={() =>
                    removeItem(name)
                  }>Delete</Button>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}